import { PageHeader } from '@/components/page-header';
import { UpdatePasswordForm } from '@/components/update-password-form';

export default function RecoveryPage() {
  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Recovery"
        title="Set your new password"
        description="Finish password recovery by choosing a new password for your account."
      />
      <section className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-sm">
        <UpdatePasswordForm />
      </section>
    </div>
  );
}
