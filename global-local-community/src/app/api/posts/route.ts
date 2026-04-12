import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assertAccountMaturity, assertMemberCan, assertRateLimit, getCurrentMember } from '@/lib/auth';
import { getFeedPosts } from '@/lib/data';
import { classifyContent, detectToxicityOrSpam } from '@/lib/intelligence';
import { getSupabaseServerClient } from '@/lib/supabase-server';

const createPostSchema = z.object({
  title: z.string().min(5),
  body: z.string().min(20),
  category: z.enum(['housing', 'jobs', 'daily-life', 'events', 'marketplace']),
  city: z.string().default('Daegu'),
  district: z.string().optional(),
  tags: z.array(z.string()).optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = await getFeedPosts({
    city: searchParams.get('city'),
    category: searchParams.get('category'),
    query: searchParams.get('query'),
    sort: searchParams.get('sort'),
  });

  return NextResponse.json({
    data,
    pagination: {
      cursor: null,
      hasMore: false,
    },
  });
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
  const classification = classifyContent(payload);
  const moderation = detectToxicityOrSpam(payload);
  const moderationStatus = moderation.label === 'spam-risk' && moderation.score >= 0.7 ? 'review' : 'published';
  const tags = (payload.tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 8);
  const imageUrls = (payload.imageUrls ?? []).slice(0, 4);

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: member.id,
      category: payload.category,
      title: payload.title.trim(),
      body: payload.body.trim(),
      city: payload.city.trim() || 'Seoul',
      district: payload.district?.trim() || null,
      tags,
      image_urls: imageUrls,
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

  await supabase.from('workflow_events').insert({
    event_type: 'post.created',
    entity_type: 'post',
    entity_id: data.id,
    payload: {
      title: payload.title,
      city: payload.city,
      category: payload.category,
      moderation_status: moderationStatus,
    },
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
