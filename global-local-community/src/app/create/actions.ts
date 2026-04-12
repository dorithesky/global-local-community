"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { classifyContent, detectToxicityOrSpam } from '@/lib/intelligence';
import { getCurrentMember } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function createPostAction(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) {
    redirect('/#signin');
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const category = String(formData.get('category') ?? 'daily-life').trim();
  const district = String(formData.get('district') ?? '').trim();
  const tagsRaw = String(formData.get('tags') ?? '').trim();
  const city = String(formData.get('city') ?? process.env.NEXT_PUBLIC_CITY ?? 'Daegu').trim() || 'Daegu';

  if (!title || !body) {
    throw new Error('Title and body are required.');
  }

  const classification = classifyContent({ title, body });
  const safety = detectToxicityOrSpam({ title, body });
  const moderationStatus = safety.label === 'spam-risk' && safety.score >= 0.7 ? 'review' : 'published';
  const tags = tagsRaw
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);

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

  revalidatePath('/');
  revalidatePath('/feed');
  revalidatePath(`/categories/${category}`);
  redirect(`/posts/${data.id}`);
}
