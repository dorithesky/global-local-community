import { classifyContent, detectToxicityOrSpam } from '@/lib/intelligence';
import { sanitizeAdminContentInput, isAllowedContentOperator } from '@/lib/admin-content';
import { logServerRequest } from '@/lib/request-logging';
import { detectSecurityAlerts, recordSecurityEvent } from '@/lib/security-events';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export async function createAdminSeedPost(input: {
  actorId?: string | null;
  actorLabel?: string | null;
  authorId: string;
  city: unknown;
  district?: unknown;
  category: unknown;
  title: unknown;
  body: unknown;
  tags?: unknown;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error('Supabase admin client is not configured.');

  const sanitized = sanitizeAdminContentInput(input);

  const [{ data: authorProfile }, { data: authorRoleRows, error: authorRoleError }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username')
      .eq('id', sanitized.authorId)
      .maybeSingle(),
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', sanitized.authorId),
  ]);

  if (!authorProfile) throw new Error('Selected author profile does not exist.');
  if (authorRoleError) throw new Error(`user_roles lookup failed: ${authorRoleError.message}`);
  const authorRoles = (authorRoleRows ?? []).map((row) => row.role);
  if (!isAllowedContentOperator(authorRoles)) {
    throw new Error('Only approved operator accounts can publish through this tool.');
  }

  const classification = classifyContent({ title: sanitized.title, body: sanitized.body });
  const safety = detectToxicityOrSpam({ title: sanitized.title, body: sanitized.body });
  const moderationStatus = safety.label === 'spam-risk' && safety.score >= 0.7 ? 'review' : 'published';

  const { data: insertedPost, error } = await supabase
    .from('posts')
    .insert({
      author_id: sanitized.authorId,
      category: sanitized.category,
      title: sanitized.title,
      body: sanitized.body,
      city: sanitized.city,
      district: sanitized.district,
      tags: sanitized.tags,
      image_urls: [],
      ai_label: classification.label,
      ai_score: classification.score,
      ai_explanation: `${classification.explanation} ${safety.explanation}`,
      moderation_status: moderationStatus,
    })
    .select('id, category, title')
    .single();

  if (error) throw new Error(error.message);

  const { error: workflowError } = await supabase.from('workflow_events').insert({
    event_type: 'moderation.seed_post_created',
    entity_type: 'post',
    entity_id: insertedPost.id,
    actor_id: input.actorId ?? null,
    payload: {
      actor_label: input.actorLabel ?? null,
      author_id: sanitized.authorId,
      author_username: authorProfile.username,
      category: sanitized.category,
      moderation_status: moderationStatus,
    },
  });

  if (workflowError) throw new Error(`workflow_events insert failed: ${workflowError.message}`);

  await logServerRequest({ userId: input.actorId ?? null, path: '/admin/seed-post' });

  try {
    await recordSecurityEvent({
      eventType: 'moderation.seed_post_created',
      severity: 'high',
      userId: input.actorId ?? null,
      path: '/admin/seed-post',
      entityType: 'post',
      entityId: insertedPost.id,
      payload: {
        authorId: sanitized.authorId,
        authorUsername: authorProfile.username,
        category: sanitized.category,
        moderationStatus,
      },
    });

    await detectSecurityAlerts();
  } catch (securityError) {
    console.error('security event logging failed for moderation.seed_post_created', securityError);
  }

  return {
    id: insertedPost.id,
    category: sanitized.category,
    title: sanitized.title,
    moderationStatus,
    authorUsername: authorProfile.username,
  };
}
