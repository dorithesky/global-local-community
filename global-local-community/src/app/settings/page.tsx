import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { AccountSettingsForm } from '@/components/account-settings-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { getCurrentMember } from '@/lib/auth';
import { markSensitiveRoute } from '@/lib/cache-policy';
import { getAccountSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Private account settings inside Living In Korea.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      nosnippet: true,
    },
  },
};

export default async function SettingsPage({ searchParams }: { searchParams?: Promise<{ onboarding?: string; saved?: string }> }) {
  markSensitiveRoute();
  const member = await getCurrentMember();
  if (!member) redirect('/');
  const settings = await getAccountSettings();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const onboarding = resolvedSearchParams?.onboarding === '1';
  const saved = resolvedSearchParams?.saved;

  return (
    <div className="space-y-5 pb-24 lg:space-y-6 lg:pb-8">
      <PageHeader
        eyebrow={onboarding ? 'Welcome' : 'Settings'}
        title={onboarding ? 'Complete your profile' : 'Settings'}
        description={onboarding ? 'Add the basics so the feed and identity make sense from day one.' : 'Manage notifications, consent, appearance, and account controls here. Public identity lives on your profile.'}
      />
      {!onboarding ? (
        <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 text-sm text-[var(--text-secondary)] shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Appearance and profile</p>
              <p className="mt-1 text-sm text-[var(--text-tertiary)]">Update your public details here, or open your profile to preview how other members see you.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <Link href={`/profile/${member.username}`} className="inline-flex min-h-11 rounded-full bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-primary-strong)]">Open profile</Link>
            </div>
          </div>
        </section>
      ) : null}
      {onboarding ? (
        <section className="rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-premium)] p-4 text-sm text-[var(--text-primary)] shadow-sm sm:p-5">
          <p className="font-semibold">Quick setup</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 leading-6">
            <li>Add your city, occupation, and origin.</li>
            <li>Choose your life stage and current need.</li>
            <li>Save, then go to the <Link href="/feed" className="font-medium text-[var(--accent-primary)] underline underline-offset-4">feed</Link> or <Link href="/create" className="font-medium text-[var(--accent-primary)] underline underline-offset-4">ask a question</Link>.</li>
          </ol>
        </section>
      ) : null}
      {saved ? (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 shadow-sm sm:p-5">
          {saved === 'profile' ? 'Profile saved.' : saved === 'notifications' ? 'Notification settings saved.' : 'Consent settings saved.'}
        </section>
      ) : null}
      {settings ? <AccountSettingsForm settings={settings} /> : null}
    </div>
  );
}
