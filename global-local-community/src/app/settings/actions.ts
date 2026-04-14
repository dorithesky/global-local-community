"use server";

import { revalidatePath } from 'next/cache';
import { assertRateLimit, getCurrentMember } from '@/lib/auth';
import { sanitizePlainText } from '@/lib/security';
import { ensureUserSettingsRow } from '@/lib/settings';

export async function saveNotificationPreferencesAction(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) throw new Error('Unauthorized');

  await assertRateLimit('settings');

  const supabase = await ensureUserSettingsRow(member.id);
  if (!supabase) throw new Error('Supabase is not configured.');

  const notifyLikes = formData.get('notifyLikes') === 'on';
  const notifyComments = formData.get('notifyComments') === 'on';

  const { error } = await supabase.from('user_settings').update({
    notify_likes: notifyLikes,
    notify_comments: notifyComments,
    updated_at: new Date().toISOString(),
  }).eq('user_id', member.id);

  if (error) throw new Error(error.message);

  revalidatePath('/settings');
  revalidatePath(`/profile/${member.username}`);
}

export async function saveConsentSettingsAction(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) throw new Error('Unauthorized');

  await assertRateLimit('settings');

  const supabase = await ensureUserSettingsRow(member.id);
  if (!supabase) throw new Error('Supabase is not configured.');

  const marketingConsent = formData.get('marketingConsent') === 'on';
  const thirdPartyEmailConsent = formData.get('thirdPartyEmailConsent') === 'on';

  const { error } = await supabase.from('user_settings').update({
    marketing_consent: marketingConsent,
    third_party_email_consent: thirdPartyEmailConsent,
    updated_at: new Date().toISOString(),
  }).eq('user_id', member.id);

  if (error) throw new Error(error.message);

  revalidatePath('/settings');
  revalidatePath(`/profile/${member.username}`);
}

export async function saveProfileIdentityAction(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) throw new Error('Unauthorized');

  await assertRateLimit('settings');

  const supabase = await ensureUserSettingsRow(member.id);
  if (!supabase) throw new Error('Supabase is not configured.');

  const displayName = sanitizePlainText(formData.get('displayName'), { maxLength: 80, allowNewlines: false });
  const bio = sanitizePlainText(formData.get('bio'), { maxLength: 500, allowNewlines: true });
  const city = sanitizePlainText(formData.get('city'), { maxLength: 40, allowNewlines: false });
  const occupation = sanitizePlainText(formData.get('occupation'), { maxLength: 80, allowNewlines: false });
  const originCountry = sanitizePlainText(formData.get('originCountry'), { maxLength: 60, allowNewlines: false });
  const lifeStage = sanitizePlainText(formData.get('lifeStage'), { maxLength: 80, allowNewlines: false });
  const immediateNeed = sanitizePlainText(formData.get('immediateNeed'), { maxLength: 40, allowNewlines: false });

  const cleanedBio = (bio.startsWith('notifications:') || bio.startsWith('consent:')) ? '' : bio;

  if (!displayName) throw new Error('Display name is required.');

  const onboardingCompleted = Boolean(city || occupation || originCountry || lifeStage || immediateNeed || cleanedBio);

  const { error } = await supabase.from('profiles').update({
    display_name: displayName,
    bio: cleanedBio || null,
    city: city || 'Seoul',
    occupation: occupation || null,
    onboarding_completed: onboardingCompleted,
    updated_at: new Date().toISOString(),
  }).eq('id', member.id);

  if (error) throw new Error(error.message);

  const { error: settingsError } = await supabase.from('user_settings').update({
    origin_country: originCountry || null,
    life_stage: lifeStage || null,
    immediate_need: immediateNeed || null,
    updated_at: new Date().toISOString(),
  }).eq('user_id', member.id);

  if (settingsError) throw new Error(settingsError.message);

  revalidatePath('/settings');
  revalidatePath(`/profile/${member.username}`);
}
