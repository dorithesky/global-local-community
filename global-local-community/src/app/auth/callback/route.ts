import { NextResponse } from 'next/server';
import { logServerRequest } from '@/lib/request-logging';
import { getSupabaseServerClient } from '@/lib/supabase-server';

function getSafeNextPath(next: string | null) {
  if (!next) return '/feed';
  if (!next.startsWith('/')) return '/feed';
  if (next.startsWith('//')) return '/feed';
  if (/[\r\n]/.test(next)) return '/feed';
  if (!/^\/[a-zA-Z0-9/_?&=%.+-]*$/.test(next)) return '/feed';
  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = getSafeNextPath(requestUrl.searchParams.get('next'));

  const supabase = await getSupabaseServerClient();
  if (code && supabase) {
    await supabase.auth.exchangeCodeForSession(code);
    const { data } = await supabase.auth.getUser();
    await logServerRequest({
      userId: data.user?.id ?? null,
      path: '/auth/callback',
    });
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
