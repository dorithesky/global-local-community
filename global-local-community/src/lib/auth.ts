import { cache } from 'react';
import { getSupabaseServerClient } from './supabase-server';

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
        isAdmin: ADMIN_EMAILS.has(email.toLowerCase()),
      };
    }

    return {
      id: user.id,
      email,
      displayName,
      username: `${preferredUsername}-${user.id.slice(0, 6)}`,
      avatarUrl,
      isAdmin: ADMIN_EMAILS.has(email.toLowerCase()),
    };
  }

  return {
    id: user.id,
    email,
    displayName: existing.display_name,
    username: existing.username,
    avatarUrl: existing.avatar_url ?? avatarUrl,
    isAdmin: ADMIN_EMAILS.has(email.toLowerCase()),
  };
});

export async function requireAdmin() {
  const member = await getCurrentMember();
  if (!member?.isAdmin) return null;
  return member;
}
