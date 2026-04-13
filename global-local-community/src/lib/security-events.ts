import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getClientIpFromHeaders } from '@/lib/request-logging';
import { sanitizePlainText } from '@/lib/security';

type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

type SecurityEventInput = {
  eventType: string;
  severity: SecuritySeverity;
  userId?: string | null;
  path?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  payload?: Record<string, unknown>;
  ip?: string | null;
};

function normalizeIp(ip: string | null) {
  if (!ip) return null;
  if (ip.includes(':')) {
    const segments = ip.split(':').filter(Boolean);
    return segments.length ? `${segments.slice(0, 4).join(':')}:*` : '*';
  }

  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.*`;
  }

  return '*';
}

export async function recordSecurityEvent(input: SecurityEventInput) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const ip = normalizeIp(input.ip ?? await getClientIpFromHeaders());
  const payload = input.payload ?? {};

  await supabase.from('security_events').insert({
    event_type: sanitizePlainText(input.eventType, { maxLength: 120, allowNewlines: false }),
    severity: input.severity,
    user_id: input.userId ?? null,
    ip,
    path: sanitizePlainText(input.path, { maxLength: 160, allowNewlines: false }) || null,
    entity_type: sanitizePlainText(input.entityType, { maxLength: 80, allowNewlines: false }) || null,
    entity_id: sanitizePlainText(input.entityId, { maxLength: 120, allowNewlines: false }) || null,
    payload,
  });
}

export async function detectSecurityAlerts() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const now = Date.now();
  const windows = {
    reports: new Date(now - 15 * 60 * 1000).toISOString(),
    uploads: new Date(now - 10 * 60 * 1000).toISOString(),
    sanctions: new Date(now - 60 * 60 * 1000).toISOString(),
    roles: new Date(now - 60 * 60 * 1000).toISOString(),
  };

  const [{ data: reportEvents }, { data: uploadEvents }, { data: sanctionEvents }, { data: roleEvents }, { data: cleanupFailures }] = await Promise.all([
    supabase.from('security_events').select('ip, created_at').eq('event_type', 'report.created').gte('created_at', windows.reports),
    supabase.from('security_events').select('ip, created_at').eq('event_type', 'upload.authorized').gte('created_at', windows.uploads),
    supabase.from('security_events').select('created_at').eq('event_type', 'moderation.user_sanctioned').gte('created_at', windows.sanctions),
    supabase.from('security_events').select('created_at, payload').in('event_type', ['moderation.role_granted', 'moderation.role_revoked']).gte('created_at', windows.roles),
    supabase.from('security_events').select('created_at, payload').in('event_type', ['upload.cleanup_partial_failure', 'upload.cleanup_db_update_failed']).gte('created_at', windows.uploads),
  ]);

  const reportCounts = new Map<string, number>();
  for (const event of reportEvents ?? []) {
    if (!event.ip) continue;
    reportCounts.set(event.ip, (reportCounts.get(event.ip) ?? 0) + 1);
  }

  const uploadCounts = new Map<string, number>();
  for (const event of uploadEvents ?? []) {
    if (!event.ip) continue;
    uploadCounts.set(event.ip, (uploadCounts.get(event.ip) ?? 0) + 1);
  }

  const alerts: Array<{ ruleName: string; severity: 'medium' | 'high' | 'critical'; summary: string; payload: Record<string, unknown> }> = [];

  for (const [ip, count] of reportCounts.entries()) {
    if (count >= 10) {
      alerts.push({
        ruleName: 'reports-per-ip-burst',
        severity: 'high',
        summary: `High report volume from ${ip}`,
        payload: { ip, count, window: '15m' },
      });
    }
  }

  for (const [ip, count] of uploadCounts.entries()) {
    if (count >= 10) {
      alerts.push({
        ruleName: 'uploads-per-ip-burst',
        severity: 'high',
        summary: `High upload authorization volume from ${ip}`,
        payload: { ip, count, window: '10m' },
      });
    }
  }

  if ((sanctionEvents ?? []).length >= 3) {
    alerts.push({
      ruleName: 'sanction-spike',
      severity: 'medium',
      summary: 'Multiple sanctions issued within 1 hour',
      payload: { count: sanctionEvents?.length ?? 0, window: '1h' },
    });
  }

  if ((roleEvents ?? []).length >= 1) {
    alerts.push({
      ruleName: 'admin-role-change',
      severity: 'critical',
      summary: 'Role change detected',
      payload: { count: roleEvents?.length ?? 0, window: '1h', events: roleEvents ?? [] },
    });
  }

  if ((cleanupFailures ?? []).length >= 1) {
    alerts.push({
      ruleName: 'upload-cleanup-failure',
      severity: 'high',
      summary: 'Upload cleanup failure detected',
      payload: { count: cleanupFailures?.length ?? 0, events: cleanupFailures ?? [] },
    });
  }

  if (!alerts.length) return;

  for (const alert of alerts) {
    const { data: existing } = await supabase
      .from('security_alerts')
      .select('id')
      .eq('rule_name', alert.ruleName)
      .eq('status', 'open')
      .limit(1);

    if (existing?.length) continue;

    await supabase.from('security_alerts').insert({
      rule_name: alert.ruleName,
      severity: alert.severity,
      summary: alert.summary,
      payload: alert.payload,
    });
  }
}
