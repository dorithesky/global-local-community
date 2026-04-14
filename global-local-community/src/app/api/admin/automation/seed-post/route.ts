import { NextResponse } from 'next/server';
import { createAdminSeedPost } from '@/lib/admin-seed-post';
import { assertAutomationSecret, getAutomationCaller } from '@/lib/internal-automation';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { detectSecurityAlerts, recordSecurityEvent } from '@/lib/security-events';

export async function POST(request: Request) {
  try {
    assertAutomationSecret(request.headers.get('x-openclaw-secret'));

    const caller = getAutomationCaller(request.headers);
    const body = await request.json();
    const actorId = String(body.actorId ?? '').trim();

    if (!actorId) {
      return NextResponse.json({ error: 'actorId is required.' }, { status: 400 });
    }

    const admin = getSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Admin client is not configured.' }, { status: 500 });
    }

    const { data: actorRoles, error: actorRoleError } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', actorId);

    if (actorRoleError) {
      return NextResponse.json({ error: actorRoleError.message }, { status: 400 });
    }

    const roles = (actorRoles ?? []).map((row) => row.role);
    if (!roles.includes('admin')) {
      return NextResponse.json({ error: 'actorId must belong to an admin.' }, { status: 403 });
    }

    const result = await createAdminSeedPost({
      actorId,
      authorId: body.authorId,
      city: body.city,
      district: body.district,
      category: body.category,
      title: body.title,
      body: body.body,
      tags: body.tags,
    });

    try {
      await recordSecurityEvent({
        eventType: 'moderation.seed_post_automation_used',
        severity: 'high',
        userId: actorId,
        path: '/api/admin/automation/seed-post',
        entityType: 'post',
        entityId: result.id,
        payload: {
          caller,
          authorId: body.authorId,
          category: body.category,
        },
      });
      await detectSecurityAlerts();
    } catch (securityError) {
      console.error('security event logging failed for moderation.seed_post_automation_used', securityError);
    }

    return NextResponse.json({ ok: true, data: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not create automation seed post.' }, { status: 401 });
  }
}
