import Image from 'next/image';
import Link from 'next/link';
import { Home, Briefcase, MessageSquare, Shield, Building2, PlusSquare } from 'lucide-react';
import { clsx } from 'clsx';
import { HeaderAuthControls } from '@/components/header-auth-controls';
import { SessionPill } from '@/components/session-pill';
import { SignOutButton } from '@/components/sign-out-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { getCurrentMember } from '@/lib/auth';

function navTone(href: string) {
  if (href === '/admin') return 'graphite';
  if (href.includes('/housing')) return 'housing';
  if (href.includes('/jobs')) return 'jobs';
  return 'default';
}

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const member = await getCurrentMember();
  const desktopNav = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/feed', label: 'Feed', icon: MessageSquare },
    { href: '/categories/housing', label: 'Housing', icon: Building2 },
    { href: '/categories/jobs', label: 'Jobs', icon: Briefcase },
    ...(member ? [
      { href: '/saved', label: 'Saved', icon: MessageSquare },
      { href: '/activity', label: 'Activity', icon: MessageSquare },
      { href: '/settings', label: 'Settings', icon: MessageSquare },
    ] : []),
    ...(member?.isAdmin ? [{ href: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  const mobileNav = member?.isAdmin
    ? [
        { href: '/', label: 'Home', icon: Home },
        { href: '/feed', label: 'Feed', icon: MessageSquare },
        { href: '/create', label: 'Post', icon: PlusSquare },
        { href: '/settings', label: 'Account', icon: MessageSquare },
        { href: '/admin', label: 'Admin', icon: Shield },
      ]
    : member
      ? [
          { href: '/', label: 'Home', icon: Home },
          { href: '/feed', label: 'Feed', icon: MessageSquare },
          { href: '/create', label: 'Post', icon: PlusSquare },
          { href: '/settings', label: 'Account', icon: MessageSquare },
        ]
      : [
          { href: '/', label: 'Home', icon: Home },
          { href: '/feed', label: 'Feed', icon: MessageSquare },
          { href: '/create', label: 'Post', icon: PlusSquare },
          { href: '/categories/jobs', label: 'Jobs', icon: Briefcase },
        ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[color:var(--surface-primary)]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-3">
          <div className="flex items-start justify-between gap-2.5 sm:items-center">
            <Link href="/feed" className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl transition hover:bg-[var(--surface-muted)]">
              <div className="overflow-hidden rounded-2xl shadow-sm">
                <Image src="/living-in-korea-logo.svg" alt="Living In Korea logo" width={44} height={44} className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" priority />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-primary)] sm:text-sm">Living In Korea</h1>
                <p className="hidden truncate text-sm font-medium leading-5 text-[var(--text-primary)] sm:block">English-first support for building life in Korea</p>
              </div>
            </Link>
            <div className="flex shrink-0 items-center gap-1 sm:hidden">
              <ThemeToggle compact />
              {member ? (
                <>
                  <SessionPill compact />
                  <SignOutButton compact />
                </>
              ) : (
                <HeaderAuthControls compact signedInContent={<></>} />
              )}
            </div>
          </div>
          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            <ThemeToggle compact />
            {member ? (
              <>
                <SessionPill />
                <SignOutButton />
              </>
            ) : (
              <HeaderAuthControls signedInContent={<></>} />
            )}
            <Link href="/create" className="hidden min-h-10 rounded-full bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--accent-primary-strong)] sm:inline-flex sm:items-center">
              Create post
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-5 px-4 py-4 sm:px-6 sm:py-5">
        <aside className="hidden w-64 shrink-0 xl:block">
          <div className="space-y-3">
            <nav className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-2.5 shadow-sm">
              {desktopNav.map((item) => {
                const Icon = item.icon;
                const tone = navTone(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition',
                      tone === 'graphite' && 'text-[var(--text-secondary)] hover:bg-slate-900 hover:text-white dark:hover:bg-slate-100',
                      tone === 'housing' && 'text-[var(--text-secondary)] hover:bg-sky-50 hover:text-sky-800 dark:hover:bg-sky-950/40 dark:hover:text-sky-200',
                      tone === 'jobs' && 'text-[var(--text-secondary)] hover:bg-indigo-50 hover:text-indigo-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-200',
                      tone === 'default' && 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Korea-wide</p>
              <p className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">
                Housing, jobs, daily life, and local questions.
              </p>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border-subtle)] bg-[color:var(--surface-primary)]/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur xl:hidden">
        <div className={clsx('grid gap-2', mobileNav.length === 5 ? 'grid-cols-5' : 'grid-cols-4')}>
          {mobileNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex min-h-14 min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[12px] font-semibold leading-tight text-[var(--text-primary)] hover:bg-[var(--surface-muted)]">
                <Icon className="mb-1 h-[18px] w-[18px] shrink-0 stroke-[2.2]" />
                <span className="w-full truncate text-center">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
