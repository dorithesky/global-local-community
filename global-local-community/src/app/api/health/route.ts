import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const envConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  let database = envConfigured ? 'unconfigured' : 'missing-env';

  if (supabase) {
    const { error } = await supabase.from('posts').select('id').limit(1);
    database = error ? 'degraded' : 'ok';
  }

  const status = database === 'ok' ? 'ok' : 'degraded';

  return NextResponse.json({
    status,
    app: 'global-local-community',
    city: process.env.NEXT_PUBLIC_CITY ?? 'Daegu',
    database,
    storageBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'missing-env',
    layers: ['interface', 'application', 'data', 'intelligence', 'orchestration'],
  }, { status: status === 'ok' ? 200 : 503 });
}
