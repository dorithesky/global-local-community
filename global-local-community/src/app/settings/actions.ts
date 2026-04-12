"use server";

import { revalidatePath } from 'next/cache';
import { getCurrentMember } from '@/lib/auth';
import { ensureUserSettingsRow } from '@/lib/settings';

export async function saveNotificationPreferencesAction(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) throw new Error('Unauthorized');

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
