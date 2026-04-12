import Link from 'next/link';
import { Home, Briefcase, MessageSquare, Shield, Building2, MapPinned, Bookmark, Bell, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { HeaderAuthControls } from '@/components/header-auth-controls';
import { SessionPill } from '@/components/session-pill';
import { SignOutButton } from '@/components/sign-out-button';
import { getCurrentMember } from '@/lib/auth';

function navTone(href: string) {
  if (href === '/admin') return 'graphite';
  if (href.includes('/housing')) return 'housing';
  if (href.includes('/jobs')) return 'jobs';
  return 'default';
}

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const member = await getCurrentMember();
  const nav = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/feed', label: 'Feed', icon: MessageSquare },
    { href: '/categories/housing', label: 'Housing', icon: Building2 },
    { href: '/categories/jobs', label: 'Jobs', icon: Briefcase },
    ...(member ? [
      { href: '/saved', label: 'Saved', icon: Bookmark },
      { href: '/activity', label: 'Activity', icon: Activity },
      { href: '/settings', label: 'Alerts', icon: Bell },
    ] : []),
    ...(member?.isAdmin ? [{ href: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm">
              <MapPinned className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-600">Global Local Community</p>
              <h1 className="truncate text-base font-semibold text-slate-950 sm:text-lg">English-first support for life in Korea</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {member ? (
              <>
                <SessionPill />
                <SignOutButton />
              </>
            ) : (
              <HeaderAuthControls signedInContent={<></>} />
            )}
            <Link href="/create" className="rounded-full bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-700">
              Create post
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-72 shrink-0 xl:block">
          <div className="space-y-4">
            <nav className="rounded-3xl border border-sky-100 bg-white p-3 shadow-sm">
              {nav.map((item) => {
                const Icon = item.icon;
                const tone = navTone(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                      tone === 'graphite' && 'text-slate-700 hover:bg-slate-900 hover:text-white',
                      tone === 'housing' && 'text-slate-700 hover:bg-sky-50 hover:text-sky-800',
                      tone === 'jobs' && 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-800',
                      tone === 'default' && 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/60 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-950">Coverage</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Korea-wide, with Seoul, Busan, Daegu, and flexible local areas supported in the posting flow.
              </p>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-2 backdrop-blur xl:hidden">
        <div className={clsx('grid gap-2', member?.isAdmin ? 'grid-cols-5' : 'grid-cols-4')}>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center rounded-2xl px-2 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-100">
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
