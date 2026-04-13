import Link from 'next/link';
import { getCurrentMember } from '@/lib/auth';

export async function SessionPill() {
  const member = await getCurrentMember();

  if (!member) {
    return (
      <Link href="/#signin" className="min-h-11 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]">
        Sign in
      </Link>
    );
  }

  return (
    <Link href={`/profile/${member.username}`} className="flex min-h-11 max-w-full items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 shadow-sm transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]">
      {member.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={member.avatarUrl} alt={member.displayName} className="h-9 w-9 rounded-full object-cover" />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-200">
          {member.displayName.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 max-w-28 sm:max-w-36">
        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{member.displayName}</p>
        <p className="truncate text-xs text-[var(--text-tertiary)]">@{member.username}</p>
      </div>
    </Link>
  );
}
