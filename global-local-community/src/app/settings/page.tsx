import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { NotificationPreferencesForm } from '@/components/notification-preferences-form';
import { getCurrentMember } from '@/lib/auth';

export default async function SettingsPage() {
  const member = await getCurrentMember();
  if (!member) redirect('/');

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Settings"
        title="Notification preferences"
        description="Decide whether you want updates when your posts receive likes or comments."
      />
      <NotificationPreferencesForm />
    </div>
  );
}
