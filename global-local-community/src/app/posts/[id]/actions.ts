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

  const parentCommentIdRaw = sanitizePlainText(formData.get('parentCommentId'), { maxLength: 64, allowNewlines: false }) || undefined;
  let parentCommentId: string | null = null;
  let rootCommentId: string | null = null;
  let depth = 0;

  if (parentCommentIdRaw) {
    const { data: parentComment, error: parentError } = await supabase
      .from('comments')
      .select('id, post_id, root_comment_id, depth, reply_count')
      .eq('id', parentCommentIdRaw)
      .maybeSingle();

    if (parentError || !parentComment || parentComment.post_id !== postId) {
      throw new Error('Reply target is invalid.');
    }

    if (Number(parentComment.depth ?? 0) >= 1) {
      throw new Error('Only one level of replies is supported right now.');
    }

    parentCommentId = parentComment.id;
    rootCommentId = parentComment.root_comment_id ?? parentComment.id;
    depth = 1;
  }

  let insertedId: string | null = null;

  const threadedInsert = await supabase.from('comments').insert({
    post_id: postId,
    author_id: member.id,
    body,
    parent_comment_id: parentCommentId,
    root_comment_id: rootCommentId,
    depth,
    reply_count: 0,
  }).select('id').single();

  if (threadedInsert.error) {
    if (threadedInsert.error.message.includes('parent_comment_id') || threadedInsert.error.message.includes('root_comment_id') || threadedInsert.error.message.includes('depth') || threadedInsert.error.message.includes('reply_count')) {
      const fallbackInsert = await supabase.from('comments').insert({
        post_id: postId,
        author_id: member.id,
        body,
      }).select('id').single();

      if (fallbackInsert.error) throw new Error(fallbackInsert.error.message);
      insertedId = fallbackInsert.data.id;
    } else {
      throw new Error(threadedInsert.error.message);
    }
  } else {
    insertedId = threadedInsert.data.id;
  }

  if (!insertedId) throw new Error('Comment could not be created.');

  if (parentCommentId) {
    const { count: liveReplyCount, error: liveReplyCountError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('parent_comment_id', parentCommentId);

    if (liveReplyCountError && !liveReplyCountError.message.includes('parent_comment_id')) {
      throw new Error(liveReplyCountError.message);
    }

    const nextReplyCount = liveReplyCount ?? 0;
    const replyCountUpdate = await supabase
      .from('comments')
      .update({ reply_count: nextReplyCount, updated_at: new Date().toISOString() })
      .eq('id', parentCommentId);

    if (replyCountUpdate.error && !replyCountUpdate.error.message.includes('reply_count')) {
      throw new Error(replyCountUpdate.error.message);
    }
  }

  await supabase.from('comment_events').insert({
    comment_id: insertedId,
    actor_id: member.id,
    event_type: 'created',
    new_body: body,
  });

  await supabase.from('workflow_events').insert({
    event_type: 'comment.created',
    entity_type: 'comment',
    entity_id: insertedId,
    payload: { post_id: postId, author_id: member.id, action: 'comment.created', parent_comment_id: parentCommentId },
  });

  await logServerRequest({
    userId: member.id,
    path: parentCommentId ? `/posts/${postId}/comments/${parentCommentId}/replies` : `/posts/${postId}/comments`,
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
