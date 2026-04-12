import { getCurrentMember } from './auth';
import { getSupabaseServerClient } from './supabase-server';

function cleanLegacyProfileText(value?: string | null) {
  if (!value) return '';
  if (value.startsWith('notifications:') || value.startsWith('consent:')) return '';
  return value;
}

export async function ensureUserSettingsRow(userId: string) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  await supabase.from('user_settings').upsert({ user_id: userId }, { onConflict: 'user_id' });
  return supabase;
}

export async function getAccountSettings() {
  const member = await getCurrentMember();
  if (!member) return null;

  const supabase = await ensureUserSettingsRow(member.id);
  if (!supabase) return null;

  const [{ data }, { data: profileData }] = await Promise.all([
    supabase
      .from('user_settings')
      .select('notify_likes, notify_comments, marketing_consent, third_party_email_consent')
      .eq('user_id', member.id)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('display_name, bio, city')
      .eq('id', member.id)
      .maybeSingle(),
  ]);

  return {
    profile: {
      displayName: profileData?.display_name ?? member.displayName,
      bio: cleanLegacyProfileText(profileData?.bio),
      city: profileData?.city ?? 'Seoul',
    },
    notifications: {
      notifyLikes: data?.notify_likes ?? true,
      notifyComments: data?.notify_comments ?? true,
    },
    consent: {
      marketingConsent: data?.marketing_consent ?? true,
      thirdPartyEmailConsent: data?.third_party_email_consent ?? true,
    },
  };
}

export async function getAdminUserSettingsView() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('user_settings')
    .select('user_id, notify_likes, notify_comments, marketing_consent, third_party_email_consent');

  return data ?? [];
}
