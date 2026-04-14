import { NextResponse } from 'next/server';
import { createAdminSeedPost } from '@/lib/admin-seed-post';
import { assertAutomationAuthorAllowed, assertAutomationRateLimit, assertAutomationSecret, assertAutomationTimestamp, getAutomationCaller } from '@/lib/internal-automation';
import { detectSecurityAlerts, recordSecurityEvent } from '@/lib/security-events';

export async function POST(request: Request) {
  try {
    assertAutomationSecret(request.headers.get('x-openclaw-secret'));
    const requestTimestamp = assertAutomationTimestamp(request.headers);

    const caller = getAutomationCaller(request.headers);
    const body = await request.json();
    const authorId = String(body.authorId ?? '').trim();
    assertAutomationAuthorAllowed(authorId);
    await assertAutomationRateLimit(caller, authorId);

    const result = await createAdminSeedPost({
      actorId: null,
      actorLabel: `automation:${caller}`,
      authorId,
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
        userId: null,
        path: '/api/admin/automation/seed-post',
        entityType: 'post',
        entityId: result.id,
        payload: {
          caller,
          authorId,
          authorUsername: result.authorUsername,
          category: body.category,
          requestTimestamp,
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
