import { headers } from 'next/headers';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { sanitizePlainText } from '@/lib/security';

type RequestLogPayload = {
  userId?: string | null;
  path: string;
  userAgent?: string | null;
  ip?: string | null;
};

const MAX_PATH_LENGTH = 160;
const MAX_USER_AGENT_LENGTH = 240;
const MAX_IP_LENGTH = 64;

export async function getClientIpFromHeaders() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get('x-forwarded-for');
  const realIp = headerStore.get('x-real-ip');
  const cfIp = headerStore.get('cf-connecting-ip');

  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return sanitizePlainText(firstIp, { maxLength: MAX_IP_LENGTH, allowNewlines: false });
  }

  return sanitizePlainText(cfIp?.trim() || realIp?.trim() || '', { maxLength: MAX_IP_LENGTH, allowNewlines: false }) || null;
}

export async function logServerRequest(payload: Omit<RequestLogPayload, 'ip' | 'userAgent'> & Partial<Pick<RequestLogPayload, 'ip' | 'userAgent'>>) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const headerStore = await headers();
  const ip = payload.ip ?? await getClientIpFromHeaders();
  const userAgent = payload.userAgent ?? headerStore.get('user-agent');

  await supabase.from('request_logs').insert({
    user_id: payload.userId ?? null,
    ip: sanitizePlainText(ip, { maxLength: MAX_IP_LENGTH, allowNewlines: false }) || null,
    path: sanitizePlainText(payload.path, { maxLength: MAX_PATH_LENGTH, allowNewlines: false }),
    user_agent: sanitizePlainText(userAgent, { maxLength: MAX_USER_AGENT_LENGTH, allowNewlines: false }) || null,
  });
}
