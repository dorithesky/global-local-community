import { getSupabaseServerClient } from './supabase-server';

export type ActiveSanction = {
  sanctionType: 'warn' | 'mute' | 'suspend' | 'ban';
  reason: string;
  note?: string;
  active: boolean;
  endsAt?: string;
};

function slugifyUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24) || 'member';
}

export async function getCurrentMember() {
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

  if (!existing) {
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      username: `${preferredUsername}-${user.id.slice(0, 6)}`,
      display_name: displayName,
      city: process.env.NEXT_PUBLIC_CITY ?? 'Daegu',
      avatar_url: avatarUrl,
      onboarding_completed: false,
    });

    if (error) {
      return {
        id: user.id,
        email,
        displayName,
        username: preferredUsername,
        avatarUrl,
        isAdmin: false,
        roles: [],
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
      isAdmin: roles.includes('admin'),
      roles,
    };
  }

  const { data: roleRows } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
  const roles = (roleRows ?? []).map((row) => row.role);

  return {
    id: user.id,
    email,
    displayName: existing.display_name,
    username: existing.username,
    avatarUrl: existing.avatar_url ?? avatarUrl,
    isAdmin: roles.includes('admin'),
    roles,
  };
}

export async function getCurrentUserCreatedAt() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user?.created_at ?? null;
}

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

export async function assertRateLimit(action: 'post' | 'comment' | 'report' | 'upload' | 'settings' | 'admin') {
  const member = await getCurrentMember();
  if (!member) return;

  const supabase = await getSupabaseServerClient();
  if (!supabase) return;

  const windows = {
    post: { table: 'posts', field: 'author_id', minutes: 15, limit: 4 },
    comment: { table: 'comments', field: 'author_id', minutes: 5, limit: 10 },
    report: { table: 'reports', field: 'reporter_id', minutes: 15, limit: 5 },
    upload: { table: 'pending_uploads', field: 'user_id', minutes: 10, limit: 24 },
    settings: { table: 'request_logs', field: 'user_id', minutes: 10, limit: 30 },
    admin: { table: 'request_logs', field: 'user_id', minutes: 5, limit: 40 },
  } as const;

  const config = windows[action];
  const since = new Date(Date.now() - config.minutes * 60 * 1000).toISOString();

  const query = supabase.from(config.table).select('*', { count: 'exact', head: true }).gte('created_at', since);
  const scoped = config.field === 'reporter_id'
    ? query.eq('reporter_id', member.id)
    : config.field === 'user_id'
      ? query.eq('user_id', member.id)
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

export function getRoleRank(roles?: string[]) {
  if (roles?.includes('admin')) return 3;
  if (roles?.includes('moderator')) return 2;
  return 1;
}

export function canRoleDeleteAuthorContent(actorRoles?: string[], targetRoles?: string[]) {
  const actorRank = getRoleRank(actorRoles);
  const targetRank = getRoleRank(targetRoles);

  if (actorRank < 2) return false;
  if (actorRank === 3) return true;
  return targetRank <= 2;
}

export async function getActiveSanctions(): Promise<ActiveSanction[]> {
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
}

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
