import Link from 'next/link';
import { Home, Briefcase, MessageSquare, Shield } from 'lucide-react';
import { clsx } from 'clsx';

const nav = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/feed', label: 'Feed', icon: MessageSquare },
  { href: '/categories/housing', label: 'Housing', icon: Home },
  { href: '/categories/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin', label: 'Admin', icon: Shield },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sky-600">Global Local Community</p>
            <h1 className="text-lg font-semibold">English-first support for life in Korea</h1>
          </div>
          <Link href="/create" className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700">
            Create post
          </Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <nav className="space-y-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={clsx('flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <p className="font-medium text-slate-900">City scope</p>
            <p>Focused on {process.env.NEXT_PUBLIC_CITY ?? 'Daegu'} first, expandable later.</p>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-2 lg:hidden">
        <div className="grid grid-cols-5 gap-2">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center rounded-2xl px-2 py-2 text-[11px] text-slate-600 hover:bg-slate-100">
                <Icon className="mb-1 h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
