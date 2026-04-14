import { NextResponse } from 'next/server';
import { assertRateLimit, getCurrentMember } from '@/lib/auth';
import { ensureUserSettingsRow } from '@/lib/settings';

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

  try {
    await assertRateLimit('settings');
    const supabase = await ensureUserSettingsRow(member.id);
    if (!supabase) return NextResponse.json({ error: 'Settings are not configured yet.' }, { status: 500 });

    const body = await request.json();
    const { error } = await supabase.from('user_settings').update({
      notify_likes: Boolean(body.notifyLikes),
      notify_comments: Boolean(body.notifyComments),
      updated_at: new Date().toISOString(),
    }).eq('user_id', member.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from('workflow_events').insert({
      event_type: 'settings.notifications_updated',
      entity_type: 'profile',
      entity_id: member.id,
      actor_id: member.id,
      payload: {
        notify_likes: Boolean(body.notifyLikes),
        notify_comments: Boolean(body.notifyComments),
      },
    });

    return NextResponse.json({ ok: true, message: 'Notification settings saved.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save notification settings.' }, { status: 500 });
  }
}
