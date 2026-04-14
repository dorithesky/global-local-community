"use server";

import { revalidatePath } from 'next/cache';
import { assertRateLimit, getCurrentMember } from '@/lib/auth';
import { sanitizePlainText } from '@/lib/security';
import { ensureUserSettingsRow } from '@/lib/settings';

export type SettingsActionState = {
  error: string | null;
  success: string | null;
};

export const INITIAL_SETTINGS_ACTION_STATE: SettingsActionState = {
  error: null,
  success: null,
};

export async function saveNotificationPreferencesAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const member = await getCurrentMember();
  if (!member) return { error: 'Please sign in again.', success: null };

  try {
    await assertRateLimit('settings');

    const supabase = await ensureUserSettingsRow(member.id);
    if (!supabase) return { error: 'Settings are not configured yet.', success: null };

    const notifyLikes = formData.get('notifyLikes') === 'on';
    const notifyComments = formData.get('notifyComments') === 'on';

    const { error } = await supabase.from('user_settings').update({
      notify_likes: notifyLikes,
      notify_comments: notifyComments,
      updated_at: new Date().toISOString(),
    }).eq('user_id', member.id);

    if (error) return { error: error.message, success: null };

    revalidatePath('/settings');
    revalidatePath(`/profile/${member.username}`);
    return { error: null, success: 'Notification settings saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not save notification settings.', success: null };
  }
}

export async function saveConsentSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const member = await getCurrentMember();
  if (!member) return { error: 'Please sign in again.', success: null };

  try {
    await assertRateLimit('settings');

    const supabase = await ensureUserSettingsRow(member.id);
    if (!supabase) return { error: 'Settings are not configured yet.', success: null };

    const marketingConsent = formData.get('marketingConsent') === 'on';
    const thirdPartyEmailConsent = formData.get('thirdPartyEmailConsent') === 'on';

    const { error } = await supabase.from('user_settings').update({
      marketing_consent: marketingConsent,
      third_party_email_consent: thirdPartyEmailConsent,
      updated_at: new Date().toISOString(),
    }).eq('user_id', member.id);

    if (error) return { error: error.message, success: null };

    revalidatePath('/settings');
    revalidatePath(`/profile/${member.username}`);
    return { error: null, success: 'Consent settings saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not save consent settings.', success: null };
  }
}

export async function saveProfileIdentityAction(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const member = await getCurrentMember();
  if (!member) return { error: 'Please sign in again.', success: null };

  try {
    await assertRateLimit('settings');

    const supabase = await ensureUserSettingsRow(member.id);
    if (!supabase) return { error: 'Settings are not configured yet.', success: null };

    const displayName = sanitizePlainText(formData.get('displayName'), { maxLength: 80, allowNewlines: false });
    const bio = sanitizePlainText(formData.get('bio'), { maxLength: 500, allowNewlines: true });
    const city = sanitizePlainText(formData.get('city'), { maxLength: 40, allowNewlines: false });
    const occupation = sanitizePlainText(formData.get('occupation'), { maxLength: 80, allowNewlines: false });
    const originCountry = sanitizePlainText(formData.get('originCountry'), { maxLength: 60, allowNewlines: false });
    const lifeStage = sanitizePlainText(formData.get('lifeStage'), { maxLength: 80, allowNewlines: false });
    const immediateNeed = sanitizePlainText(formData.get('immediateNeed'), { maxLength: 40, allowNewlines: false });

    const cleanedBio = (bio.startsWith('notifications:') || bio.startsWith('consent:')) ? '' : bio;

    if (!displayName) return { error: 'Display name is required.', success: null };

    const onboardingCompleted = Boolean(city || occupation || originCountry || lifeStage || immediateNeed || cleanedBio);

    const { error } = await supabase.from('profiles').update({
      display_name: displayName,
      bio: cleanedBio || null,
      city: city || 'Seoul',
      occupation: occupation || null,
      onboarding_completed: onboardingCompleted,
      updated_at: new Date().toISOString(),
    }).eq('id', member.id);

    if (error) return { error: error.message, success: null };

    const { error: settingsError } = await supabase.from('user_settings').update({
      origin_country: originCountry || null,
      life_stage: lifeStage || null,
      immediate_need: immediateNeed || null,
      updated_at: new Date().toISOString(),
    }).eq('user_id', member.id);

    if (settingsError) return { error: settingsError.message, success: null };

    revalidatePath('/settings');
    revalidatePath(`/profile/${member.username}`);
    return { error: null, success: 'Profile saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not save your profile.', success: null };
  }
}
