import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assertAccountMaturity, assertMemberCan, assertRateLimit, getCurrentMember } from '@/lib/auth';
import { logServerRequest } from '@/lib/request-logging';
import { getSupabaseServerClient } from '@/lib/supabase-server';

const reportSchema = z.object({
  postId: z.string().uuid().optional(),
  commentId: z.string().uuid().optional(),
  reason: z.string().min(3),
  details: z.string().optional(),
}).refine((value) => Boolean(value.postId || value.commentId), {
  message: 'A postId or commentId is required.',
});

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await assertMemberCan('report');
  await assertAccountMaturity('report');
  await assertRateLimit('report');

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
  }

  const parsed = reportSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const target = payload.postId ? { post_id: payload.postId, comment_id: null } : { post_id: null, comment_id: payload.commentId ?? null };

  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: member.id,
      ...target,
      reason: payload.reason.trim(),
      details: payload.details?.trim() || null,
    })
    .select('id, status')
    .single();

  if (error) {
    const status = error.code === '23505' ? 409 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }

  await supabase.from('workflow_events').insert({
    event_type: 'report.created',
    entity_type: payload.postId ? 'post' : 'comment',
    entity_id: payload.postId ?? payload.commentId ?? null,
    payload: {
      reporter_id: member.id,
      reason: payload.reason.trim(),
    },
  });

  await logServerRequest({
    userId: member.id,
    path: '/api/reports',
  });

  return NextResponse.json({
    data: {
      id: data.id,
      status: data.status,
    },
  });
}
