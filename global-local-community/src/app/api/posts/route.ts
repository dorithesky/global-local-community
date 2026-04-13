import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assertAccountMaturity, assertMemberCan, assertRateLimit, getCurrentMember } from '@/lib/auth';
import { getFeedPosts } from '@/lib/data';
import { classifyContent, detectToxicityOrSpam } from '@/lib/intelligence';
import { logServerRequest } from '@/lib/request-logging';
import { sanitizePlainText } from '@/lib/security';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { attachPendingUploadsToPost } from '@/lib/upload-validation';

const createPostSchema = z.object({
  title: z.string().min(5),
  body: z.string().min(20),
  category: z.enum(['housing', 'jobs', 'daily-life', 'events', 'marketplace']),
  city: z.string().default('Daegu'),
  district: z.string().optional(),
  tags: z.array(z.string()).optional(),
  uploadIds: z.array(z.string().uuid()).optional(),
  uploadTokens: z.array(z.string().min(1)).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = await getFeedPosts({
    city: searchParams.get('city'),
    category: searchParams.get('category'),
    query: searchParams.get('query'),
    sort: searchParams.get('sort'),
  });

  return NextResponse.json(
    {
      data,
      pagination: {
        cursor: null,
        hasMore: false,
      },
    },
    {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
      },
    },
  );
}

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await assertMemberCan('post');
  await assertAccountMaturity('post');
  await assertRateLimit('post');

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
  }

  const payload = createPostSchema.parse(await request.json());
  const sanitizedPayload = {
    ...payload,
    title: sanitizePlainText(payload.title, { maxLength: 140, allowNewlines: false }),
    body: sanitizePlainText(payload.body, { maxLength: 5000, allowNewlines: true }),
    city: sanitizePlainText(payload.city, { maxLength: 40, allowNewlines: false }),
    district: sanitizePlainText(payload.district, { maxLength: 80, allowNewlines: false }),
    tags: (payload.tags ?? []).map((tag) => sanitizePlainText(tag, { maxLength: 32, allowNewlines: false }).toLowerCase()).filter(Boolean).slice(0, 8),
    uploadIds: (payload.uploadIds ?? []).slice(0, 4),
    uploadTokens: (payload.uploadTokens ?? []).slice(0, 4),
  };

  if (sanitizedPayload.uploadIds.length !== sanitizedPayload.uploadTokens.length) {
    return NextResponse.json({ error: 'Uploaded media authorization is incomplete.' }, { status: 400 });
  }

  const classification = classifyContent(sanitizedPayload);
  const moderation = detectToxicityOrSpam(sanitizedPayload);
  const moderationStatus = moderation.label === 'spam-risk' && moderation.score >= 0.7 ? 'review' : 'published';
  const tags = sanitizedPayload.tags;

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: member.id,
      category: sanitizedPayload.category,
      title: sanitizedPayload.title,
      body: sanitizedPayload.body,
      city: sanitizedPayload.city || 'Seoul',
      district: sanitizedPayload.district || null,
      tags,
      image_urls: [],
      ai_label: classification.label,
      ai_score: classification.score,
      ai_explanation: `${classification.explanation} ${moderation.explanation}`,
      moderation_status: moderationStatus,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    await attachPendingUploadsToPost({
      supabase,
      userId: member.id,
      postId: data.id,
      uploadIds: sanitizedPayload.uploadIds,
      uploadTokens: sanitizedPayload.uploadTokens,
      moderationStatus,
    });
  } catch (attachError) {
    await supabase.from('posts').delete().eq('id', data.id);
    return NextResponse.json({ error: attachError instanceof Error ? attachError.message : 'Could not attach uploaded media.' }, { status: 400 });
  }

  await supabase.from('workflow_events').insert({
    event_type: 'post.created',
    entity_type: 'post',
    entity_id: data.id,
    payload: {
      title: sanitizedPayload.title,
      city: sanitizedPayload.city,
      category: sanitizedPayload.category,
      moderation_status: moderationStatus,
    },
  });

  await logServerRequest({
    userId: member.id,
    path: '/api/posts',
  });

  return NextResponse.json(
    {
      data: {
        id: data.id,
        moderationStatus,
        classification,
        moderation,
      },
    },
    { status: 201 },
  );
}
