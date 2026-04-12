import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const envConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  let ok = false;

  if (supabase && envConfigured) {
    const { error } = await supabase.from('posts').select('id').limit(1);
    ok = !error;
  }

  return NextResponse.json({
    status: ok ? 'ok' : 'degraded',
  }, { status: ok ? 200 : 503 });
}
