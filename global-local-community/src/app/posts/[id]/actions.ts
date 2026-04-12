"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/auth';
import { canCurrentMemberManageComment } from '@/lib/data';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function createCommentAction(postId: string, formData: FormData) {
  const member = await getCurrentMember();
  if (!member) redirect('/#signin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const body = String(formData.get('body') ?? '').trim();
  if (!body) throw new Error('Comment body is required.');

  const { data, error } = await supabase.from('comments').insert({
    post_id: postId,
    author_id: member.id,
    body,
  }).select('id').single();

  if (error) throw new Error(error.message);

  await supabase.from('comment_events').insert({
    comment_id: data.id,
    actor_id: member.id,
    event_type: 'created',
    new_body: body,
  });

  await supabase.from('workflow_events').insert({
    event_type: 'post.created',
    entity_type: 'comment',
    entity_id: null,
    payload: { post_id: postId, author_id: member.id, action: 'comment.created' },
  });

  revalidatePath(`/posts/${postId}`);
}

export async function updateCommentAction(postId: string, formData: FormData) {
  const member = await getCurrentMember();
  if (!member) redirect('/#signin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const commentId = String(formData.get('commentId') ?? '');
  const body = String(formData.get('body') ?? '').trim();
  if (!commentId || !body) throw new Error('Comment update is incomplete.');

  const { data: existing } = await supabase
    .from('comments')
    .select('author_id, body')
    .eq('id', commentId)
    .maybeSingle();

  const canManage = Boolean(existing && existing.author_id === member.id) || await canCurrentMemberManageComment(commentId);
  if (!canManage) throw new Error('Unauthorized');

  const { error } = await supabase.from('comments').update({ body, updated_at: new Date().toISOString() }).eq('id', commentId);
  if (error) throw new Error(error.message);

  await supabase.from('comment_events').insert({
    comment_id: commentId,
    actor_id: member.id,
    event_type: 'edited',
    old_body: existing?.body,
    new_body: body,
  });

  revalidatePath(`/posts/${postId}`);
}

export async function deleteCommentAction(postId: string, formData: FormData) {
  const member = await getCurrentMember();
  if (!member) redirect('/#signin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const commentId = String(formData.get('commentId') ?? '');
  if (!commentId) throw new Error('Comment delete is incomplete.');

  const { data: existing } = await supabase
    .from('comments')
    .select('author_id, body')
    .eq('id', commentId)
    .maybeSingle();

  const canManage = Boolean(existing && existing.author_id === member.id) || await canCurrentMemberManageComment(commentId);
  if (!canManage) throw new Error('Unauthorized');

  await supabase.from('comment_events').insert({
    comment_id: commentId,
    actor_id: member.id,
    event_type: 'deleted',
    old_body: existing?.body,
  });

  const softDeleteAttempt = await supabase
    .from('comments')
    .update({
      body: '',
      deleted_at: new Date().toISOString(),
      deleted_by: member.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId);

  if (softDeleteAttempt.error && softDeleteAttempt.error.message.includes("deleted_at")) {
    const hardFallback = await supabase.from('comments').delete().eq('id', commentId);
    if (hardFallback.error) throw new Error(hardFallback.error.message);
  } else if (softDeleteAttempt.error) {
    throw new Error(softDeleteAttempt.error.message);
  }

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
