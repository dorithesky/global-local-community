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
      .select('notify_likes, notify_comments, marketing_consent, third_party_email_consent, origin_country, life_stage, immediate_need')
      .eq('user_id', member.id)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('display_name, bio, city, occupation')
      .eq('id', member.id)
      .maybeSingle(),
  ]);

  return {
    profile: {
      displayName: profileData?.display_name ?? member.displayName,
      bio: cleanLegacyProfileText(profileData?.bio),
      city: profileData?.city ?? 'Seoul',
      occupation: profileData?.occupation ?? '',
      originCountry: data?.origin_country ?? '',
      lifeStage: data?.life_stage ?? '',
      immediateNeed: data?.immediate_need ?? '',
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

  if (!data?.length) return [];

  const userIds = data.map((row) => row.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, display_name, city')
    .in('id', userIds);

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return data.map((row) => ({
    ...row,
    profile: profileMap.get(row.user_id)
      ? {
          id: profileMap.get(row.user_id)?.id,
          username: profileMap.get(row.user_id)?.username,
          displayName: profileMap.get(row.user_id)?.display_name,
          city: profileMap.get(row.user_id)?.city,
        }
      : null,
  }));
}
