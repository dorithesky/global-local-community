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

  const [{ data }, { data: profiles }, { data: sanctions }, { data: roles }] = await Promise.all([
    supabase
      .from('user_settings')
      .select('user_id, notify_likes, notify_comments, marketing_consent, third_party_email_consent, origin_country, life_stage, immediate_need, created_at, updated_at'),
    supabase
      .from('profiles')
      .select('id, username, display_name, city, occupation, onboarding_completed, created_at'),
    supabase
      .from('user_sanctions')
      .select('user_id, sanction_type, reason, active, created_at')
      .eq('active', true),
    supabase
      .from('user_roles')
      .select('user_id, role'),
  ]);

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const sanctionMap = new Map((sanctions ?? []).map((sanction) => [sanction.user_id, sanction]));
  const roleMap = new Map<string, string[]>();
  for (const roleRow of roles ?? []) {
    const existingRoles = roleMap.get(roleRow.user_id) ?? [];
    existingRoles.push(roleRow.role);
    roleMap.set(roleRow.user_id, existingRoles);
  }

  const rows = data ?? [];
  const knownUserIds = new Set(rows.map((row) => row.user_id));
  const profileOnlyRows = (profiles ?? [])
    .filter((profile) => !knownUserIds.has(profile.id))
    .map((profile) => ({
      user_id: profile.id,
      notify_likes: true,
      notify_comments: true,
      marketing_consent: true,
      third_party_email_consent: true,
      origin_country: null,
      life_stage: null,
      immediate_need: null,
      created_at: profile.created_at,
      updated_at: profile.created_at,
    }));

  return [...rows, ...profileOnlyRows].map((row) => ({
    ...row,
    roles: roleMap.get(row.user_id) ?? [],
    activeSanction: sanctionMap.get(row.user_id)
      ? {
          type: sanctionMap.get(row.user_id)?.sanction_type,
          reason: sanctionMap.get(row.user_id)?.reason,
          createdAt: sanctionMap.get(row.user_id)?.created_at,
        }
      : null,
    profile: profileMap.get(row.user_id)
      ? {
          id: profileMap.get(row.user_id)?.id,
          username: profileMap.get(row.user_id)?.username,
          displayName: profileMap.get(row.user_id)?.display_name,
          city: profileMap.get(row.user_id)?.city,
          occupation: profileMap.get(row.user_id)?.occupation,
          onboardingCompleted: profileMap.get(row.user_id)?.onboarding_completed,
          createdAt: profileMap.get(row.user_id)?.created_at,
        }
      : null,
  }));
}
