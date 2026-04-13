"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin, requireModerator } from '@/lib/auth';
import { logServerRequest } from '@/lib/request-logging';
import { getSupabaseServerClient } from '@/lib/supabase-server';

const roleChangeSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['admin', 'moderator']),
  intent: z.enum(['grant', 'revoke']),
  confirm: z.string().trim().toLowerCase().optional(),
});

export async function updateReportStatusAction(formData: FormData) {
  const moderator = await requireModerator();
  if (!moderator) throw new Error('Unauthorized');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const reportId = String(formData.get('reportId') ?? '');
  const status = String(formData.get('status') ?? 'open');

  const { error } = await supabase.from('reports').update({ status }).eq('id', reportId);
  if (error) throw new Error(error.message);

  await supabase.from('workflow_events').insert({
    event_type: 'moderation.report_status_updated',
    entity_type: 'report',
    entity_id: reportId,
    payload: {
      status,
      moderator_id: moderator.id,
    },
  });

  await logServerRequest({ userId: moderator.id, path: '/admin/actions/report-status' });

  revalidatePath('/admin');
  revalidatePath('/admin/reports');
}

export async function setReportedPostVisibilityAction(formData: FormData) {
  const moderator = await requireModerator();
  if (!moderator) throw new Error('Unauthorized');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const postId = String(formData.get('postId') ?? '');
  const moderationStatus = String(formData.get('moderationStatus') ?? 'published');
  const note = String(formData.get('note') ?? '').trim();
  if (!postId) throw new Error('Missing post id');

  const { data: post } = await supabase.from('posts').select('author_id').eq('id', postId).maybeSingle();
  const { error } = await supabase.from('posts').update({ moderation_status: moderationStatus }).eq('id', postId);
  if (error) throw new Error(error.message);

  await supabase.from('workflow_events').insert({
    event_type: 'moderation.post_visibility_updated',
    entity_type: 'post',
    entity_id: postId,
    payload: {
      moderation_status: moderationStatus,
      moderator_id: moderator.id,
      note,
    },
  });

  if (note) {
    await supabase.from('moderator_notes').insert({
      target_user_id: post?.author_id ?? null,
      post_id: postId,
      author_id: moderator.id,
      note,
    });
  }

  await logServerRequest({ userId: moderator.id, path: '/admin/actions/post-visibility' });

  revalidatePath('/admin');
  revalidatePath('/admin/reports');
  revalidatePath(`/posts/${postId}`);
  revalidatePath('/feed');
}

export async function addModeratorNoteAction(formData: FormData) {
  const moderator = await requireModerator();
  if (!moderator) throw new Error('Unauthorized');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const targetUserId = String(formData.get('targetUserId') ?? '').trim() || null;
  const reportId = String(formData.get('reportId') ?? '').trim() || null;
  const postId = String(formData.get('postId') ?? '').trim() || null;
  const commentId = String(formData.get('commentId') ?? '').trim() || null;
  const note = String(formData.get('note') ?? '').trim();

  if (!note) throw new Error('Note is required.');

  const { error } = await supabase.from('moderator_notes').insert({
    target_user_id: targetUserId,
    report_id: reportId,
    post_id: postId,
    comment_id: commentId,
    author_id: moderator.id,
    note,
  });

  if (error) throw new Error(error.message);

  await logServerRequest({ userId: moderator.id, path: '/admin/actions/moderator-note' });

  revalidatePath('/admin');
  revalidatePath('/admin/reports');
}

export async function applyUserSanctionAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const userId = String(formData.get('userId') ?? '').trim();
  const sanctionType = String(formData.get('sanctionType') ?? '').trim();
  const reason = String(formData.get('reason') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();
  const confirm = String(formData.get('confirm') ?? '').trim();

  if (!userId || !sanctionType || !reason) throw new Error('Incomplete sanction request.');
  if (confirm !== 'yes') throw new Error('Sanction confirmation missing.');

  const { error } = await supabase.from('user_sanctions').insert({
    user_id: userId,
    sanction_type: sanctionType,
    reason,
    note: note || null,
    created_by: admin.id,
  });

  if (error) throw new Error(error.message);

  await supabase.from('workflow_events').insert({
    event_type: 'moderation.user_sanctioned',
    entity_type: 'profile',
    entity_id: userId,
    payload: {
      sanction_type: sanctionType,
      reason,
      admin_id: admin.id,
    },
  });

  await logServerRequest({ userId: admin.id, path: '/admin/actions/user-sanction' });

  revalidatePath('/admin');
}

export async function updateUserRoleAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const parsed = roleChangeSchema.safeParse({
    userId: String(formData.get('userId') ?? '').trim(),
    role: String(formData.get('role') ?? '').trim(),
    intent: String(formData.get('intent') ?? '').trim(),
    confirm: String(formData.get('confirm') ?? '').trim() || undefined,
  });

  if (!parsed.success) throw new Error('Invalid role change request.');

  const { userId, role, intent, confirm } = parsed.data;
  if (role === 'admin' && confirm !== 'yes') {
    throw new Error('Admin role changes require explicit confirmation.');
  }

  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!targetProfile) throw new Error('Target user not found.');

  if (intent === 'grant') {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role, created_by: admin.id }, { onConflict: 'user_id,role' });

    if (error) throw new Error(error.message);
  } else {
    if (role === 'admin') {
      const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if ((count ?? 0) <= 1) {
        throw new Error('Cannot remove the last admin.');
      }
    }

    if (admin.id === userId && role === 'admin') {
      throw new Error('Use another admin account before removing your own admin role.');
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) throw new Error(error.message);
  }

  await supabase.from('workflow_events').insert({
    event_type: intent === 'grant' ? 'moderation.role_granted' : 'moderation.role_revoked',
    entity_type: 'profile',
    entity_id: userId,
    payload: {
      role,
      actor_id: admin.id,
      intent,
    },
  });

  await logServerRequest({ userId: admin.id, path: '/admin/actions/user-role' });

  revalidatePath('/admin');
  revalidatePath('/admin/members');
  revalidatePath('/feed');
}
