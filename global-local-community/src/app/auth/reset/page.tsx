import { PageHeader } from '@/components/page-header';
import { ResetPasswordForm } from '@/components/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Reset password"
        title="Recover access without drama"
        description="Enter your email and we will send you a password reset link."
      />
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <ResetPasswordForm />
      </section>
    </div>
  );
}
