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
        title="Account and communication settings"
        description="Manage how the product reaches you, and what communication you agree to receive."
      />
      {settings ? <AccountSettingsForm settings={settings} /> : null}
    </div>
  );
}
