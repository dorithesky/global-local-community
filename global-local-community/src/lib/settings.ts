import { getCurrentMember } from './auth';
import { getSupabaseServerClient } from './supabase-server';

function parsePrefString(prefix: string, value?: string | null) {
  if (!value || !value.startsWith(prefix)) return {};
  try {
    return JSON.parse(value.slice(prefix.length));
  } catch {
    return {};
  }
}

export async function getAccountSettings() {
  const member = await getCurrentMember();
  if (!member) return null;

  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('profiles')
    .select('bio, occupation')
    .eq('id', member.id)
    .maybeSingle();

  const notifications = parsePrefString('notifications:', data?.bio);
  const consent = parsePrefString('consent:', data?.occupation);

  return {
    notifications: {
      notifyLikes: notifications.notifyLikes ?? true,
      notifyComments: notifications.notifyComments ?? true,
    },
    consent: {
      marketingConsent: consent.marketingConsent ?? true,
      thirdPartyEmailConsent: consent.thirdPartyEmailConsent ?? true,
    },
  };
}
