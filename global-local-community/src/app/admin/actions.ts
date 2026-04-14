"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { assertRateLimit, requireAdmin, requireModerator } from '@/lib/auth';
import { isAllowedOperatorUsername, sanitizeAdminContentInput } from '@/lib/admin-content';
import { classifyContent, detectToxicityOrSpam } from '@/lib/intelligence';
import { logServerRequest } from '@/lib/request-logging';
import { detectSecurityAlerts, recordSecurityEvent } from '@/lib/security-events';
import { getSupabaseServerClient } from '@/lib/supabase-server';

const roleChangeSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['admin', 'moderator']),
  intent: z.enum(['grant', 'revoke']),
  confirm: z.string().trim().toLowerCase().optional(),
});

const reportStatusSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(['open', 'reviewing', 'resolved']),
});

const postVisibilitySchema = z.object({
  postId: z.string().uuid(),
  moderationStatus: z.enum(['published', 'hidden', 'review']),
  note: z.string().trim().max(500).optional(),
});

const userSanctionSchema = z.object({
  userId: z.string().min(1),
  sanctionType: z.enum(['warn', 'mute', 'suspend', 'ban']),
  reason: z.string().trim().min(3).max(200),
  note: z.string().trim().max(500).optional(),
  confirm: z.string().trim().toLowerCase(),
});

const moderatorNoteSchema = z.object({
  targetUserId: z.string().trim().optional(),
  reportId: z.string().uuid().optional(),
  postId: z.string().uuid().optional(),
  commentId: z.string().uuid().optional(),
  note: z.string().trim().min(3).max(500),
}).refine((value) => Boolean(value.targetUserId || value.reportId || value.postId || value.commentId), {
  message: 'Moderator note must target a report, post, comment, or member.',
});

const adminSeedPostSchema = z.object({
  authorId: z.string().uuid(),
  city: z.string().min(1),
  district: z.string().optional(),
  category: z.string().min(1),
  title: z.string().min(5).max(140),
  body: z.string().min(20).max(5000),
  tags: z.string().optional(),
});

export async function updateReportStatusAction(formData: FormData) {
  const moderator = await requireModerator();
  if (!moderator) throw new Error('Unauthorized');

  await assertRateLimit('admin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const parsed = reportStatusSchema.safeParse({
    reportId: String(formData.get('reportId') ?? '').trim(),
    status: String(formData.get('status') ?? 'open').trim().toLowerCase(),
  });

  if (!parsed.success) throw new Error('Invalid report status update.');

  const { reportId, status } = parsed.data;

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

  try {
    await recordSecurityEvent({
      eventType: 'moderation.report_status_updated',
      severity: 'medium',
      userId: moderator.id,
      path: '/admin/actions/report-status',
      entityType: 'report',
      entityId: reportId,
      payload: { status },
    });

    await detectSecurityAlerts();
  } catch (securityError) {
    console.error('security event logging failed for moderation.report_status_updated', securityError);
  }

  revalidatePath('/admin');
  revalidatePath('/admin/reports');
}

export async function setReportedPostVisibilityAction(formData: FormData) {
  const moderator = await requireModerator();
  if (!moderator) throw new Error('Unauthorized');

  await assertRateLimit('admin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const parsed = postVisibilitySchema.safeParse({
    postId: String(formData.get('postId') ?? '').trim(),
    moderationStatus: String(formData.get('moderationStatus') ?? 'published').trim().toLowerCase(),
    note: String(formData.get('note') ?? '').trim() || undefined,
  });

  if (!parsed.success) throw new Error('Invalid post visibility request.');

  const { postId, moderationStatus, note } = parsed.data;

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

  try {
    await recordSecurityEvent({
      eventType: 'moderation.post_visibility_updated',
      severity: 'medium',
      userId: moderator.id,
      path: '/admin/actions/post-visibility',
      entityType: 'post',
      entityId: postId,
      payload: { moderationStatus },
    });

    await detectSecurityAlerts();
  } catch (securityError) {
    console.error('security event logging failed for moderation.post_visibility_updated', securityError);
  }

  revalidatePath('/admin');
  revalidatePath('/admin/reports');
  revalidatePath(`/posts/${postId}`);
  revalidatePath('/feed');
}

export async function addModeratorNoteAction(formData: FormData) {
  const moderator = await requireModerator();
  if (!moderator) throw new Error('Unauthorized');

  await assertRateLimit('admin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const parsed = moderatorNoteSchema.safeParse({
    targetUserId: String(formData.get('targetUserId') ?? '').trim() || undefined,
    reportId: String(formData.get('reportId') ?? '').trim() || undefined,
    postId: String(formData.get('postId') ?? '').trim() || undefined,
    commentId: String(formData.get('commentId') ?? '').trim() || undefined,
    note: String(formData.get('note') ?? '').trim(),
  });

  if (!parsed.success) throw new Error('Moderator note is incomplete or invalid.');

  const { targetUserId, reportId, postId, commentId, note } = parsed.data;

  const { error } = await supabase.from('moderator_notes').insert({
    target_user_id: targetUserId ?? null,
    report_id: reportId ?? null,
    post_id: postId ?? null,
    comment_id: commentId ?? null,
    author_id: moderator.id,
    note,
  });

  if (error) throw new Error(error.message);

  await supabase.from('workflow_events').insert({
    event_type: 'moderation.note_added',
    entity_type: reportId ? 'report' : commentId ? 'comment' : postId ? 'post' : 'profile',
    entity_id: reportId ?? commentId ?? postId ?? targetUserId ?? null,
    actor_id: moderator.id,
    payload: {
      report_id: reportId ?? null,
      post_id: postId ?? null,
      comment_id: commentId ?? null,
      target_user_id: targetUserId ?? null,
    },
  });

  await logServerRequest({ userId: moderator.id, path: '/admin/actions/moderator-note' });

  revalidatePath('/admin');
  revalidatePath('/admin/reports');
}

export async function applyUserSanctionAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  await assertRateLimit('admin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const parsed = userSanctionSchema.safeParse({
    userId: String(formData.get('userId') ?? '').trim(),
    sanctionType: String(formData.get('sanctionType') ?? '').trim().toLowerCase(),
    reason: String(formData.get('reason') ?? '').trim(),
    note: String(formData.get('note') ?? '').trim() || undefined,
    confirm: String(formData.get('confirm') ?? '').trim().toLowerCase(),
  });

  if (!parsed.success) throw new Error('Incomplete or invalid sanction request.');

  const { userId, sanctionType, reason, note, confirm } = parsed.data;
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

  try {
    await recordSecurityEvent({
      eventType: 'moderation.user_sanctioned',
      severity: 'high',
      userId: admin.id,
      path: '/admin/actions/user-sanction',
      entityType: 'profile',
      entityId: userId,
      payload: { sanctionType, reason },
    });

    await detectSecurityAlerts();
  } catch (securityError) {
    console.error('security event logging failed for moderation.user_sanctioned', securityError);
  }

  revalidatePath('/admin');
}

export async function createAdminSeedPostAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  await assertRateLimit('admin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const parsed = adminSeedPostSchema.safeParse({
    authorId: String(formData.get('authorId') ?? '').trim(),
    city: String(formData.get('city') ?? '').trim(),
    district: String(formData.get('district') ?? '').trim() || undefined,
    category: String(formData.get('category') ?? '').trim(),
    title: String(formData.get('title') ?? '').trim(),
    body: String(formData.get('body') ?? '').trim(),
    tags: String(formData.get('tags') ?? '').trim() || undefined,
  });

  if (!parsed.success) throw new Error('Seed post request is incomplete or invalid.');

  const input = sanitizeAdminContentInput(parsed.data);

  const { data: authorProfile } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', input.authorId)
    .maybeSingle();

  if (!authorProfile) throw new Error('Selected author profile does not exist.');
  if (!isAllowedOperatorUsername(authorProfile.username)) {
    throw new Error('Only approved operator accounts can publish through this tool.');
  }

  const classification = classifyContent({ title: input.title, body: input.body });
  const safety = detectToxicityOrSpam({ title: input.title, body: input.body });
  const moderationStatus = safety.label === 'spam-risk' && safety.score >= 0.7 ? 'review' : 'published';

  const { data: insertedPost, error } = await supabase
    .from('posts')
    .insert({
      author_id: input.authorId,
      category: input.category,
      title: input.title,
      body: input.body,
      city: input.city,
      district: input.district,
      tags: input.tags,
      image_urls: [],
      ai_label: classification.label,
      ai_score: classification.score,
      ai_explanation: `${classification.explanation} ${safety.explanation}`,
      moderation_status: moderationStatus,
    })
    .select('id, category, title')
    .single();

  if (error) throw new Error(error.message);

  await supabase.from('workflow_events').insert({
    event_type: 'moderation.seed_post_created',
    entity_type: 'post',
    entity_id: insertedPost.id,
    actor_id: admin.id,
    payload: {
      author_id: input.authorId,
      author_username: authorProfile.username,
      category: input.category,
      moderation_status: moderationStatus,
    },
  });

  await logServerRequest({ userId: admin.id, path: '/admin/actions/seed-post' });

  try {
    await recordSecurityEvent({
      eventType: 'moderation.seed_post_created',
      severity: 'high',
      userId: admin.id,
      path: '/admin/actions/seed-post',
      entityType: 'post',
      entityId: insertedPost.id,
      payload: {
        authorId: input.authorId,
        authorUsername: authorProfile.username,
        category: input.category,
        moderationStatus,
      },
    });

    await detectSecurityAlerts();
  } catch (securityError) {
    console.error('security event logging failed for moderation.seed_post_created', securityError);
  }

  revalidatePath('/');
  revalidatePath('/feed');
  revalidatePath('/admin');
  revalidatePath(`/categories/${input.category}`);
}

export async function updateUserRoleAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  await assertRateLimit('admin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const rawUserId = String(formData.get('userId') ?? '').trim();
  const rawRole = String(formData.get('role') ?? '').trim().toLowerCase();
  const rawIntent = String(formData.get('intent') ?? '').trim().toLowerCase();
  const rawConfirm = String(formData.get('confirm') ?? '').trim().toLowerCase() || undefined;

  if (!rawUserId || (rawRole !== 'admin' && rawRole !== 'moderator') || (rawIntent !== 'grant' && rawIntent !== 'revoke')) {
    throw new Error(`Invalid role change request. userId=${rawUserId || 'missing'} role=${rawRole || 'missing'} intent=${rawIntent || 'missing'}`);
  }

  const parsed = roleChangeSchema.safeParse({
    userId: rawUserId,
    role: rawRole,
    intent: rawIntent,
    confirm: rawConfirm,
  });

  if (!parsed.success) throw new Error(`Invalid role change request. userId=${rawUserId || 'missing'} role=${rawRole || 'missing'} intent=${rawIntent || 'missing'}`);

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

  try {
    await recordSecurityEvent({
      eventType: intent === 'grant' ? 'moderation.role_granted' : 'moderation.role_revoked',
      severity: 'critical',
      userId: admin.id,
      path: '/admin/actions/user-role',
      entityType: 'profile',
      entityId: userId,
      payload: { role, intent },
    });

    await detectSecurityAlerts();
  } catch (securityError) {
    console.error(`security event logging failed for ${intent === 'grant' ? 'moderation.role_granted' : 'moderation.role_revoked'}`, securityError);
  }

  revalidatePath('/admin');
  revalidatePath('/admin/members');
  revalidatePath('/feed');
}
