import { headers } from 'next/headers';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

type RequestLogPayload = {
  userId?: string | null;
  path: string;
  userAgent?: string | null;
  ip?: string | null;
};

export async function getClientIpFromHeaders() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get('x-forwarded-for');
  const realIp = headerStore.get('x-real-ip');
  const cfIp = headerStore.get('cf-connecting-ip');

  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  return cfIp?.trim() || realIp?.trim() || null;
}

export async function logServerRequest(payload: Omit<RequestLogPayload, 'ip' | 'userAgent'> & Partial<Pick<RequestLogPayload, 'ip' | 'userAgent'>>) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const headerStore = await headers();
  const ip = payload.ip ?? await getClientIpFromHeaders();
  const userAgent = payload.userAgent ?? headerStore.get('user-agent');

  await supabase.from('request_logs').insert({
    user_id: payload.userId ?? null,
    ip,
    path: payload.path,
    user_agent: userAgent,
  });
}
