import { NextResponse } from 'next/server';
import { logServerRequest } from '@/lib/request-logging';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/settings?onboarding=1';

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
