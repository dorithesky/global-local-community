import { ShieldCheck, ShieldEllipsis } from 'lucide-react';

export function RoleBadge({ role }: { role: 'admin' | 'moderator' }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-700">
        <ShieldCheck className="h-3 w-3" />
        Admin
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
      <ShieldEllipsis className="h-3 w-3" />
      Mod
    </span>
  );
}
