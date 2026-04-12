import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { AccountSettingsForm } from '@/components/account-settings-form';
import { getCurrentMember } from '@/lib/auth';
import { getAccountSettings } from '@/lib/settings';

export default async function SettingsPage({ searchParams }: { searchParams?: Promise<{ onboarding?: string }> }) {
  const member = await getCurrentMember();
  if (!member) redirect('/');
  const settings = await getAccountSettings();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const onboarding = resolvedSearchParams?.onboarding === '1';

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader
        eyebrow={onboarding ? 'Welcome' : 'Settings'}
        title={onboarding ? 'Finish your onboarding' : 'Account, onboarding, and communication settings'}
        description={onboarding ? 'Complete your profile so the product can show the right city context, member identity, and relevant community needs from the start.' : 'Tell the product who you are, what you need right now, and how it should reach you.'}
      />
      {onboarding ? (
        <section className="rounded-3xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-950 shadow-sm">
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
