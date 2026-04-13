import Link from 'next/link';
import { getCurrentMember } from '@/lib/auth';

export async function SessionPill({ compact = false }: { compact?: boolean } = {}) {
  const member = await getCurrentMember();

  if (!member) {
    return (
      <Link href="/#signin" className={`${compact ? 'min-h-10 px-3.5 py-2 text-sm' : 'min-h-11 px-4 py-2.5 text-sm'} rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] font-medium text-[var(--text-primary)] shadow-sm transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]`}>
        Sign in
      </Link>
    );
  }

  return (
    <Link href={`/profile/${member.username}`} className={`flex max-w-full items-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-sm transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] ${compact ? 'min-h-10 gap-2 px-2.5 py-1.5' : 'min-h-11 gap-3 px-3 py-2'}`}>
      {member.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={member.avatarUrl} alt={member.displayName} className={`${compact ? 'h-8 w-8' : 'h-9 w-9'} rounded-full object-cover`} />
      ) : (
        <div className={`flex ${compact ? 'h-8 w-8 text-[11px]' : 'h-9 w-9 text-xs'} items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-200`}>
          {member.displayName.slice(0, 1).toUpperCase()}
        </div>
      )}
      {!compact ? (
        <div className="min-w-0 max-w-28 sm:max-w-36">
          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{member.displayName}</p>
          <p className="truncate text-xs text-[var(--text-tertiary)]">@{member.username}</p>
        </div>
      ) : null}
    </Link>
  );
}
