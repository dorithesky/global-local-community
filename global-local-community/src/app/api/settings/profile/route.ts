import { NextResponse } from 'next/server';
import { assertRateLimit, getCurrentMember } from '@/lib/auth';
import { sanitizePlainText } from '@/lib/security';
import { ensureUserSettingsRow } from '@/lib/settings';

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

  try {
    await assertRateLimit('settings');
    const supabase = await ensureUserSettingsRow(member.id);
    if (!supabase) return NextResponse.json({ error: 'Settings are not configured yet.' }, { status: 500 });

    const body = await request.json();
    const displayName = sanitizePlainText(body.displayName, { maxLength: 80, allowNewlines: false });
    const bio = sanitizePlainText(body.bio, { maxLength: 500, allowNewlines: true });
    const city = sanitizePlainText(body.city, { maxLength: 40, allowNewlines: false });
    const occupation = sanitizePlainText(body.occupation, { maxLength: 80, allowNewlines: false });
    const originCountry = sanitizePlainText(body.originCountry, { maxLength: 60, allowNewlines: false });
    const lifeStage = sanitizePlainText(body.lifeStage, { maxLength: 80, allowNewlines: false });
    const immediateNeed = sanitizePlainText(body.immediateNeed, { maxLength: 40, allowNewlines: false });
    const cleanedBio = (bio.startsWith('notifications:') || bio.startsWith('consent:')) ? '' : bio;

    if (!displayName) return NextResponse.json({ error: 'Display name is required.' }, { status: 400 });

    const onboardingCompleted = Boolean(city || occupation || originCountry || lifeStage || immediateNeed || cleanedBio);

    const { error } = await supabase.from('profiles').update({
      display_name: displayName,
      bio: cleanedBio || null,
      city: city || 'Seoul',
      occupation: occupation || null,
      onboarding_completed: onboardingCompleted,
      updated_at: new Date().toISOString(),
    }).eq('id', member.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const { error: settingsError } = await supabase.from('user_settings').update({
      origin_country: originCountry || null,
      life_stage: lifeStage || null,
      immediate_need: immediateNeed || null,
      updated_at: new Date().toISOString(),
    }).eq('user_id', member.id);

    if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 400 });

    await supabase.from('workflow_events').insert({
      event_type: 'profile.updated',
      entity_type: 'profile',
      entity_id: member.id,
      actor_id: member.id,
      payload: {
        city: city || 'Seoul',
        occupation: occupation || null,
      },
    });

    return NextResponse.json({ ok: true, message: 'Profile saved.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save your profile.' }, { status: 500 });
  }
}
