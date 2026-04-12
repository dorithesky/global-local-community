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
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin workspace</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Operations console</h2>
            <nav className="mt-4 space-y-2">
              {ADMIN_NAV_ITEMS.map((item) => {
                const active = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-2xl border px-3 py-3 transition ${active ? 'border-sky-200 bg-sky-50 text-sky-950' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'}`}
                  >
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className={`mt-1 text-xs ${active ? 'text-sky-800' : 'text-slate-500'}`}>{item.description}</p>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Access</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">These admin routes are intended to stay server-gated and unavailable to non-admin users.</p>
          </div>
        </aside>

        <div className="space-y-6">
          <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </header>
          {children}
        </div>
      </section>
    </div>
  );
}
