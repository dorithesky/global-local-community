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

  const buckets = new Map<string, Array<{ id: string; path: string }>>();
  for (const row of rows) {
    const existing = buckets.get(row.bucket) ?? [];
    existing.push({ id: row.id, path: row.storage_path });
    buckets.set(row.bucket, existing);
  }

  const removedIds: string[] = [];
  const failures: Array<{ bucket: string; paths: string[]; error: string }> = [];

  for (const [bucket, entries] of buckets.entries()) {
    const paths = entries.map((entry) => entry.path);
    const { error: removeError } = await adminClient.storage.from(bucket).remove(paths);

    if (removeError) {
      failures.push({ bucket, paths, error: removeError.message });
      continue;
    }

    removedIds.push(...entries.map((entry) => entry.id));
  }

  if (removedIds.length) {
    const { error: updateError } = await supabase
      .from('pending_uploads')
      .update({ status: 'expired', updated_at: now })
      .in('id', removedIds);

    if (updateError) {
      await supabase.from('workflow_events').insert({
        event_type: 'uploads.cleanup_db_update_failed',
        entity_type: 'pending_upload',
        entity_id: null,
        payload: {
          actor_id: member.id,
          removed_ids: removedIds,
          error: updateError.message,
        },
      });

      return NextResponse.json({ error: 'Storage cleanup succeeded, but upload state reconciliation failed.' }, { status: 500 });
    }
  }

  if (failures.length) {
    await supabase.from('workflow_events').insert({
      event_type: 'uploads.cleanup_partial_failure',
      entity_type: 'pending_upload',
      entity_id: null,
      payload: {
        actor_id: member.id,
        failures,
        removed_count: removedIds.length,
      },
    });
  }

  return NextResponse.json({
    data: {
      removed: removedIds.length,
      failed: failures.length,
      partialFailure: failures.length > 0,
    },
  });
}
