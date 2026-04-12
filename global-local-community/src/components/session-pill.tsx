import Link from 'next/link';
import { getCurrentMember } from '@/lib/auth';

export async function SessionPill() {
  const member = await getCurrentMember();

  if (!member) {
    return (
      <Link href="/#signin" className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
        Sign in
      </Link>
    );
  }

  return (
    <Link href={`/profile/${member.username}`} className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
      {member.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={member.avatarUrl} alt={member.displayName} className="h-9 w-9 rounded-full object-cover" />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
          {member.displayName.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 max-w-36">
        <p className="truncate text-sm font-semibold text-slate-900">{member.displayName}</p>
        <p className="truncate text-xs text-slate-500">@{member.username}</p>
      </div>
    </Link>
  );
}
