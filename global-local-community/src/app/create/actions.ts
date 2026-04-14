"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { classifyContent, detectToxicityOrSpam } from '@/lib/intelligence';
import { assertAccountMaturity, assertMemberCan, assertRateLimit, getCurrentMember } from '@/lib/auth';
import { logServerRequest } from '@/lib/request-logging';
import { sanitizePlainText, sanitizeTagList } from '@/lib/security';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { attachPendingUploadsToPost } from '@/lib/upload-validation';

export async function createPostAction(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) {
    redirect('/#signin');
  }

  await assertMemberCan('post');
  await assertAccountMaturity('post');
  await assertRateLimit('post');

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const title = sanitizePlainText(formData.get('title'), { maxLength: 140, allowNewlines: false });
  const body = sanitizePlainText(formData.get('body'), { maxLength: 5000, allowNewlines: true });
  const category = sanitizePlainText(formData.get('category') ?? 'daily-life', { maxLength: 40, allowNewlines: false });
  const allowedCategories = new Set(['housing', 'jobs', 'visa', 'healthcare', 'banking', 'phone-internet', 'transport', 'documents', 'daily-life', 'events', 'meetups', 'local-tips', 'marketplace']);
  const district = sanitizePlainText(formData.get('district'), { maxLength: 80, allowNewlines: false });
  const tags = sanitizeTagList(formData.get('tags'));
  const city = sanitizePlainText(formData.get('city') ?? process.env.NEXT_PUBLIC_CITY ?? 'Seoul', { maxLength: 40, allowNewlines: false }) || 'Seoul';

  if (!title || !body) {
    throw new Error('Title and body are required.');
  }

  if (!allowedCategories.has(category)) {
    throw new Error('Category is invalid.');
  }

  const uploadIds = formData.getAll('uploadIds').map(String).filter(Boolean).slice(0, 4);
  const uploadTokens = formData.getAll('uploadTokens').map(String).filter(Boolean).slice(0, 4);

  if (uploadIds.length !== uploadTokens.length) {
    throw new Error('Uploaded media authorization is incomplete.');
  }

  const classification = classifyContent({ title, body });
  const safety = detectToxicityOrSpam({ title, body });
  const moderationStatus = safety.label === 'spam-risk' && safety.score >= 0.7 ? 'review' : 'published';

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: member.id,
      category,
      title,
      body,
      city,
      district: district || null,
      tags,
      image_urls: [],
      ai_label: classification.label,
      ai_score: classification.score,
      ai_explanation: `${classification.explanation} ${safety.explanation}`,
      moderation_status: moderationStatus,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  try {
    await attachPendingUploadsToPost({
      supabase,
      userId: member.id,
      postId: data.id,
      uploadIds,
      uploadTokens,
      moderationStatus,
    });
  } catch (attachError) {
    await supabase.from('posts').delete().eq('id', data.id);
    throw attachError;
  }

  await supabase.from('workflow_events').insert({
    event_type: 'post.created',
    entity_type: 'post',
    entity_id: data.id,
    payload: {
      title,
      category,
      moderation_status: moderationStatus,
      ai_label: classification.label,
      ai_score: classification.score,
    },
  });

  await logServerRequest({
    userId: member.id,
    path: '/create',
  });

  revalidatePath('/');
  revalidatePath('/feed');
  revalidatePath(`/categories/${category}`);
  redirect(`/posts/${data.id}`);
}
