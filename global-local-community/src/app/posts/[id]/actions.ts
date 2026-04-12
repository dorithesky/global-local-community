"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function createCommentAction(postId: string, formData: FormData) {
  const member = await getCurrentMember();
  if (!member) redirect('/#signin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const body = String(formData.get('body') ?? '').trim();
  if (!body) throw new Error('Comment body is required.');

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    author_id: member.id,
    body,
  });

  if (error) throw new Error(error.message);

  await supabase.from('workflow_events').insert({
    event_type: 'post.created',
    entity_type: 'comment',
    entity_id: null,
    payload: { post_id: postId, author_id: member.id, action: 'comment.created' },
  });

  revalidatePath(`/posts/${postId}`);
}

export async function createReportAction(postId: string, formData: FormData) {
  const member = await getCurrentMember();
  if (!member) redirect('/#signin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const reason = String(formData.get('reason') ?? '').trim();
  const details = String(formData.get('details') ?? '').trim();
  if (!reason) throw new Error('Reason is required.');

  const { error } = await supabase.from('reports').insert({
    reporter_id: member.id,
    post_id: postId,
    reason,
    details: details || null,
  });

  if (error) throw new Error(error.message);

  await supabase.from('workflow_events').insert({
    event_type: 'report.created',
    entity_type: 'post',
    entity_id: postId,
    payload: { reason, reporter_id: member.id },
  });

  revalidatePath('/admin');
  revalidatePath(`/posts/${postId}`);
}
