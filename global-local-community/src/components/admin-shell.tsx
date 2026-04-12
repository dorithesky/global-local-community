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
    <div className="space-y-6 pb-24 lg:pb-8">
      <section className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)] xl:items-start">
        <aside className="space-y-4 xl:sticky xl:top-6">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Admin workspace</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Operations console</h2>
            <nav className="mt-4 space-y-2">
              {ADMIN_NAV_ITEMS.map((item) => {
                const active = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-2xl border px-3 py-3 transition ${active ? 'border-amber-300 bg-amber-50 text-slate-950' : 'border-slate-700 bg-slate-800/70 text-slate-200 hover:border-slate-500 hover:bg-slate-800'}`}
                  >
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className={`mt-1 text-xs ${active ? 'text-amber-800' : 'text-slate-400'}`}>{item.description}</p>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Access</p>
            <p className="mt-3 text-sm leading-6 text-amber-950">These admin routes are intended to stay server-gated and unavailable to non-admin users.</p>
          </div>
        </aside>

        <div className="space-y-6">
          <header className="rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-amber-50/50 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Admin</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </header>
          {children}
        </div>
      </section>
    </div>
  );
}
