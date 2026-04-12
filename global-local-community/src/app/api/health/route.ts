import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = await getSupabaseServerClient();
  let database = 'unconfigured';

  if (supabase) {
    const { error } = await supabase.from('posts').select('id').limit(1);
    database = error ? 'degraded' : 'ok';
  }

  return NextResponse.json({
    status: database === 'degraded' ? 'degraded' : 'ok',
    app: 'global-local-community',
    city: process.env.NEXT_PUBLIC_CITY ?? 'Daegu',
    database,
    layers: ['interface', 'application', 'data', 'intelligence', 'orchestration'],
  });
}
