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
      marketing_consent: Boolean(body.marketingConsent),
      third_party_email_consent: Boolean(body.thirdPartyEmailConsent),
      updated_at: new Date().toISOString(),
    }).eq('user_id', member.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from('workflow_events').insert({
      event_type: 'settings.consent_updated',
      entity_type: 'profile',
      entity_id: member.id,
      actor_id: member.id,
      payload: {
        marketing_consent: Boolean(body.marketingConsent),
        third_party_email_consent: Boolean(body.thirdPartyEmailConsent),
      },
    });

    return NextResponse.json({ ok: true, message: 'Consent settings saved.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save consent settings.' }, { status: 500 });
  }
}
