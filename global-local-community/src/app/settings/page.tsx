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

export default async function SettingsPage({ searchParams }: { searchParams?: Promise<{ onboarding?: string }> }) {
  markSensitiveRoute();
  const member = await getCurrentMember();
  if (!member) redirect('/');
  const settings = await getAccountSettings();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const onboarding = resolvedSearchParams?.onboarding === '1';

  return (
    <div className="space-y-5 pb-24 lg:space-y-6 lg:pb-8">
      <PageHeader
        eyebrow={onboarding ? 'Welcome' : 'Settings'}
        title={onboarding ? 'Finish your onboarding' : 'Settings'}
        description={onboarding ? 'Complete your profile so the product can show the right city context, member identity, and relevant community needs from the start.' : 'Manage notifications, consent, appearance, and account controls here. Public identity now lives on your profile.'}
      />
      {!onboarding ? (
        <section className="rounded-3xl border border-slate-200 bg-[var(--surface-primary)] p-4 text-sm text-[var(--text-secondary)] shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Public identity moved out of Settings</p>
              <p className="mt-1 text-sm text-[var(--text-tertiary)]">Use your profile page when you want to review how you appear to other members.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <Link href={`/profile/${member.username}`} className="inline-flex min-h-11 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500">Open profile</Link>
            </div>
          </div>
        </section>
      ) : null}
      {onboarding ? (
        <section className="rounded-3xl border border-sky-200 bg-[var(--surface-premium)] p-4 text-sm text-[var(--text-primary)] shadow-sm sm:p-5">
          <p className="font-semibold">Start here</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 leading-6">
            <li>Set your city, occupation, and origin so your profile reads like a real member identity.</li>
            <li>Choose your life stage and immediate need so the community can route you into the right conversations.</li>
            <li>Save this page, then go to the <Link href="/feed" className="font-medium text-sky-700 underline underline-offset-4">feed</Link> or <Link href="/create" className="font-medium text-sky-700 underline underline-offset-4">ask your first question</Link>.</li>
          </ol>
        </section>
      ) : null}
      {settings ? <AccountSettingsForm settings={settings} /> : null}
    </div>
  );
}
