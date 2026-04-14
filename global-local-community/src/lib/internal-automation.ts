import crypto from 'crypto';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sanitizePlainText } from '@/lib/security';

const MAX_TOKEN_LENGTH = 256;
const MAX_CALLER_LENGTH = 80;
const MAX_AUTHOR_COUNT = 50;
const AUTOMATION_TIMESTAMP_MAX_SKEW_MS = 5 * 60 * 1000;
const AUTOMATION_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const AUTOMATION_RATE_LIMIT_MAX = 5;

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function getAutomationSecret() {
  return sanitizePlainText(process.env.OPENCLAW_AUTOMATION_SECRET, { maxLength: MAX_TOKEN_LENGTH, allowNewlines: false }) || '';
}

export function assertAutomationSecret(requestSecret: string | null) {
  const configured = getAutomationSecret();
  if (!configured) {
    throw new Error('Automation secret is not configured.');
  }

  const candidate = sanitizePlainText(requestSecret, { maxLength: MAX_TOKEN_LENGTH, allowNewlines: false });
  if (!candidate || !safeEqual(candidate, configured)) {
    throw new Error('Invalid automation secret.');
  }
}

export function getAutomationCaller(headers: Headers) {
  return sanitizePlainText(headers.get('x-openclaw-caller') ?? 'unknown', { maxLength: MAX_CALLER_LENGTH, allowNewlines: false }) || 'unknown';
}

export function getAllowedAutomationAuthorIds() {
  return (process.env.OPENCLAW_AUTOMATION_AUTHOR_IDS ?? '')
    .split(',')
    .map((value) => sanitizePlainText(value, { maxLength: 80, allowNewlines: false }))
    .filter(Boolean)
    .slice(0, MAX_AUTHOR_COUNT);
}

export function assertAutomationAuthorAllowed(authorId: string) {
  const allowedAuthorIds = getAllowedAutomationAuthorIds();
  if (!allowedAuthorIds.length) {
    throw new Error('Automation author allowlist is not configured.');
  }

  if (!allowedAuthorIds.includes(authorId)) {
    throw new Error('authorId is not allowed for automation publishing.');
  }
}

export function assertAutomationTimestamp(headers: Headers) {
  const value = sanitizePlainText(headers.get('x-openclaw-timestamp'), { maxLength: 64, allowNewlines: false });
  if (!value) {
    throw new Error('Missing automation timestamp.');
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error('Invalid automation timestamp.');
  }

  if (Math.abs(Date.now() - timestamp) > AUTOMATION_TIMESTAMP_MAX_SKEW_MS) {
    throw new Error('Automation request timestamp is outside the allowed freshness window.');
  }

  return value;
}

export async function assertAutomationRateLimit(caller: string, authorId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Automation rate limiting is unavailable because the admin client is not configured.');
  }

  const windowStart = new Date(Date.now() - AUTOMATION_RATE_LIMIT_WINDOW_MS).toISOString();
  const { data, error } = await supabase
    .from('security_events')
    .select('id, payload, created_at')
    .eq('event_type', 'moderation.seed_post_automation_used')
    .gte('created_at', windowStart);

  if (error) {
    throw new Error(`Automation rate limit lookup failed: ${error.message}`);
  }

  const matchingCount = (data ?? []).filter((row) => {
    const payload = typeof row.payload === 'object' && row.payload ? row.payload as Record<string, unknown> : {};
    return payload.caller === caller && payload.authorId === authorId;
  }).length;

  if (matchingCount >= AUTOMATION_RATE_LIMIT_MAX) {
    throw new Error('Automation publish rate limit exceeded for this caller/author window.');
  }
}
