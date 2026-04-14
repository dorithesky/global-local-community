import Link from 'next/link';
import { ReactNode } from 'react';

type AdminNavItem = {
  href: string;
  label: string;
  description: string;
};

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin', label: 'Overview', description: 'KPIs, watchlist, and shortcuts' },
  { href: '/admin/reports', label: 'Reports', description: 'Review and resolve moderation cases' },
  { href: '/admin/members', label: 'Members', description: 'Search members, roles, and sanctions' },
  { href: '/admin/activity', label: 'Activity', description: 'Audit trail and recent community actions' },
];

export function AdminShell({ currentPath, title, description, children }: { currentPath: string; title: string; description: string; children: ReactNode }) {
  return (
    <div className="space-y-5 pb-24 lg:space-y-6 lg:pb-8">
      <section className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)] xl:items-start xl:gap-6">
        <aside className="space-y-4 xl:sticky xl:top-6">
          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-admin)] p-4 text-white shadow-sm sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Admin workspace</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Operations console</h2>
            <nav className="mt-4 space-y-2">
              {ADMIN_NAV_ITEMS.map((item) => {
                const active = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-2xl border px-3 py-3 transition ${active ? 'border-[var(--border-strong)] bg-[var(--surface-elevated)] text-[var(--text-primary)]' : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10'}`}
                  >
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className={`mt-1 text-xs ${active ? 'text-[var(--text-secondary)]' : 'text-slate-400'}`}>{item.description}</p>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="rounded-3xl border border-[var(--border-strong)] bg-[var(--accent-soft)] p-4 shadow-sm sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary)]">Access</p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-primary)]">These admin routes are intended to stay server-gated and unavailable to non-admin users.</p>
          </div>
        </aside>

        <div className="space-y-6">
          <header className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary)]">Admin</p>
            <h1 className="mt-2 text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
          </header>
          {children}
        </div>
      </section>
    </div>
  );
}
