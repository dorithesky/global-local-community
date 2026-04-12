import { cache } from 'react';
import { getSupabaseServerClient } from './supabase-server';

export type ActiveSanction = {
  sanctionType: 'warn' | 'mute' | 'suspend' | 'ban';
  reason: string;
  note?: string;
  active: boolean;
  endsAt?: string;
};

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? 'scottchmoon@gmail.com')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

function slugifyUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24) || `member`;
}

export const getCurrentMember = cache(async () => {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData.user;
  if (!user) return null;

  const email = user.email ?? '';
  const preferredUsername = slugifyUsername(
    String(user.user_metadata?.user_name ?? user.user_metadata?.name ?? email.split('@')[0] ?? 'member'),
  );
  const displayName = String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? email.split('@')[0] ?? 'Member');
  const avatarUrl = typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : undefined;

  const { data: existing } = await supabase
    .from('profiles')
    .select('id, username, display_name, city, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const envAdmin = ADMIN_EMAILS.has(email.toLowerCase());

  if (!existing) {
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      username: `${preferredUsername}-${user.id.slice(0, 6)}`,
      display_name: displayName,
      city: process.env.NEXT_PUBLIC_CITY ?? 'Daegu',
      avatar_url: avatarUrl,
      onboarding_completed: false,
    });

    if (!error && envAdmin) {
      await supabase.from('user_roles').upsert({ user_id: user.id, role: 'admin' }, { onConflict: 'user_id,role' });
    }

    if (error) {
      return {
        id: user.id,
        email,
        displayName,
        username: preferredUsername,
        avatarUrl,
        isAdmin: envAdmin,
      };
    }

    const { data: createdRoles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
    const roles = (createdRoles ?? []).map((row) => row.role);

    return {
      id: user.id,
      email,
      displayName,
      username: `${preferredUsername}-${user.id.slice(0, 6)}`,
      avatarUrl,
      isAdmin: envAdmin || roles.includes('admin'),
      roles,
    };
  }

  if (envAdmin) {
    await supabase.from('user_roles').upsert({ user_id: user.id, role: 'admin' }, { onConflict: 'user_id,role' });
  }

  const { data: roleRows } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
  const roles = (roleRows ?? []).map((row) => row.role);

  return {
    id: user.id,
    email,
    displayName: existing.display_name,
    username: existing.username,
    avatarUrl: existing.avatar_url ?? avatarUrl,
    isAdmin: envAdmin || roles.includes('admin'),
    roles,
  };
});

export const getCurrentUserCreatedAt = cache(async () => {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user?.created_at ?? null;
});

export async function assertAccountMaturity(action: 'post' | 'comment' | 'report') {
  const createdAt = await getCurrentUserCreatedAt();
  if (!createdAt) return;

  const created = new Date(createdAt).getTime();
  const ageMinutes = (Date.now() - created) / (1000 * 60);

  if (action === 'post' && ageMinutes < 2) {
    throw new Error('New accounts need a short warm-up before posting. Please try again in a couple of minutes.');
  }

  if ((action === 'comment' || action === 'report') && ageMinutes < 1) {
    throw new Error('Please wait a moment before using this action on a brand-new account.');
  }
}

export async function assertRateLimit(action: 'post' | 'comment' | 'report') {
  const member = await getCurrentMember();
  if (!member) return;

  const supabase = await getSupabaseServerClient();
  if (!supabase) return;

  const windows = {
    post: { table: 'posts', field: 'author_id', minutes: 10, limit: 5 },
    comment: { table: 'comments', field: 'author_id', minutes: 5, limit: 12 },
    report: { table: 'reports', field: 'reporter_id', minutes: 10, limit: 8 },
  } as const;

  const config = windows[action];
  const since = new Date(Date.now() - config.minutes * 60 * 1000).toISOString();

  const query = supabase.from(config.table).select('*', { count: 'exact', head: true }).gte('created_at', since);
  const scoped = config.field === 'reporter_id'
    ? query.eq('reporter_id', member.id)
    : query.eq('author_id', member.id);

  const { count } = await scoped;
  if ((count ?? 0) >= config.limit) {
    throw new Error(`Rate limit reached for ${action}. Please wait a bit and try again.`);
  }
}

export async function requireAdmin() {
  const member = await getCurrentMember();
  if (!member?.isAdmin) return null;
  return member;
}

export async function requireModerator() {
  const member = await getCurrentMember();
  if (!member) return null;
  if (member.isAdmin || member.roles?.includes('moderator')) return member;
  return null;
}

export async function requireRole(role: 'admin' | 'moderator') {
  if (role === 'admin') return requireAdmin();
  return requireModerator();
}

export const getActiveSanctions = cache(async (): Promise<ActiveSanction[]> => {
  const member = await getCurrentMember();
  if (!member) return [];

  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('user_sanctions')
    .select('sanction_type, reason, note, active, ends_at')
    .eq('user_id', member.id)
    .eq('active', true)
    .or(`ends_at.is.null,ends_at.gt.${now}`);

  if (error || !data?.length) return [];

  return data.map((row) => ({
    sanctionType: row.sanction_type,
    reason: row.reason,
    note: row.note ?? undefined,
    active: row.active,
    endsAt: row.ends_at ?? undefined,
  }));
});

export async function assertMemberCan(action: 'post' | 'comment' | 'engage' | 'report') {
  const sanctions = await getActiveSanctions();
  const blocking = sanctions.find((sanction) => {
    if (sanction.sanctionType === 'ban' || sanction.sanctionType === 'suspend') return true;
    if (action === 'comment' && sanction.sanctionType === 'mute') return true;
    if ((action === 'post' || action === 'engage' || action === 'report') && sanction.sanctionType === 'mute') return true;
    return false;
  });

  if (blocking) {
    throw new Error(`Account restricted: ${blocking.sanctionType}. ${blocking.reason}`);
  }
}
