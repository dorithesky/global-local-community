import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { AccountSettingsForm } from '@/components/account-settings-form';
import { getCurrentMember } from '@/lib/auth';
import { getAccountSettings } from '@/lib/settings';

export default async function SettingsPage() {
  const member = await getCurrentMember();
  if (!member) redirect('/');
  const settings = await getAccountSettings();

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Settings"
        title="Account, onboarding, and communication settings"
        description="Tell the product who you are, what you need right now, and how it should reach you."
      />
      {settings ? <AccountSettingsForm settings={settings} /> : null}
    </div>
  );
}
