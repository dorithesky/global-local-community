"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { assertAccountMaturity, assertMemberCan, assertRateLimit, getCurrentMember } from '@/lib/auth';
import { canCurrentMemberManageComment } from '@/lib/data';
import { logServerRequest } from '@/lib/request-logging';
import { sanitizePlainText } from '@/lib/security';
import { getSupabaseServerClient } from '@/lib/supabase-server';

const reportSchema = z.object({
  postId: z.string().uuid().optional(),
  commentId: z.string().uuid().optional(),
  reason: z.string().min(3),
  details: z.string().optional(),
}).refine((value) => Boolean(value.postId || value.commentId), {
  message: 'A postId or commentId is required.',
}).refine((value) => !(value.postId && value.commentId), {
  message: 'Report must target either a post or a comment, not both.',
});

export async function createCommentAction(postId: string, formData: FormData) {
  const member = await getCurrentMember();
  if (!member) redirect('/#signin');

  await assertMemberCan('comment');
  await assertAccountMaturity('comment');
  await assertRateLimit('comment');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const body = sanitizePlainText(formData.get('body'), { maxLength: 2000, allowNewlines: true });
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
    event_type: 'comment.created',
    entity_type: 'comment',
    entity_id: data.id,
    payload: { post_id: postId, author_id: member.id, action: 'comment.created' },
  });

  await logServerRequest({
    userId: member.id,
    path: `/posts/${postId}/comments`,
  });

  revalidatePath(`/posts/${postId}`);
}

export async function updateCommentAction(postId: string, formData: FormData) {
  const member = await getCurrentMember();
  if (!member) redirect('/#signin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const commentId = String(formData.get('commentId') ?? '');
  const body = sanitizePlainText(formData.get('body'), { maxLength: 2000, allowNewlines: true });
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
  revalidatePath('/activity');
  revalidatePath('/feed');
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
  revalidatePath('/activity');
  revalidatePath('/feed');
}

export async function createReportAction(postId: string, formData: FormData) {
  const member = await getCurrentMember();
  if (!member) redirect('/#signin');

  await assertMemberCan('report');
  await assertAccountMaturity('report');
  await assertRateLimit('report');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const commentId = formData.get('commentId') ? String(formData.get('commentId')) : undefined;

  const parsed = reportSchema.safeParse({
    postId: commentId ? undefined : postId,
    commentId,
    reason: sanitizePlainText(formData.get('reason'), { maxLength: 80, allowNewlines: false }),
    details: sanitizePlainText(formData.get('details'), { maxLength: 500, allowNewlines: true }) || undefined,
  });

  if (!parsed.success) {
    throw new Error('Reason is required.');
  }

  const payload = parsed.data;

  const { error } = await supabase.from('reports').insert({
    reporter_id: member.id,
    post_id: payload.postId ?? null,
    comment_id: payload.commentId ?? null,
    reason: payload.reason,
    details: payload.details ?? null,
  });

  if (error) {
    if (error.code === '23505') {
      throw new Error('You already reported this item.');
    }
    throw new Error(error.message);
  }

  await supabase.from('workflow_events').insert({
    event_type: 'report.created',
    entity_type: payload.commentId ? 'comment' : 'post',
    entity_id: payload.commentId ?? payload.postId ?? null,
    payload: { reason: payload.reason, reporter_id: member.id },
  });

  await logServerRequest({
    userId: member.id,
    path: payload.commentId ? `/posts/${postId}/report-comment` : `/posts/${postId}/report`,
  });

  revalidatePath('/admin');
  revalidatePath(`/posts/${postId}`);
}
