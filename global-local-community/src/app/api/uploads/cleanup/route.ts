import { NextResponse } from 'next/server';
import { getCurrentMember, requireAdmin } from '@/lib/auth';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function POST() {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const adminClient = getSupabaseAdminClient();
  if (!supabase || !adminClient) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
  }

  const now = new Date().toISOString();
  const query = supabase
    .from('pending_uploads')
    .select('id, bucket, storage_path')
    .in('status', ['authorized', 'uploaded'])
    .lt('expires_at', now)
    .limit(admin ? 100 : 20);

  const scopedQuery = admin ? query : query.eq('user_id', member.id);
  const { data, error } = await scopedQuery;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const rows = data ?? [];
  if (!rows.length) {
    return NextResponse.json({ data: { removed: 0 } });
  }

  const buckets = new Map<string, string[]>();
  for (const row of rows) {
    const existing = buckets.get(row.bucket) ?? [];
    existing.push(row.storage_path);
    buckets.set(row.bucket, existing);
  }

  for (const [bucket, paths] of buckets.entries()) {
    await adminClient.storage.from(bucket).remove(paths);
  }

  await supabase
    .from('pending_uploads')
    .update({ status: 'expired', updated_at: now })
    .in('id', rows.map((row) => row.id));

  return NextResponse.json({ data: { removed: rows.length } });
}
