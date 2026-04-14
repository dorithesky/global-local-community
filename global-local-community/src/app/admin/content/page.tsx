import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { AdminSeedPostForm } from '@/components/admin-actions';
import { createAdminSeedPostAction } from '@/app/admin/actions';
import { requireAdmin } from '@/lib/auth';
import { getAdminUserSettingsView } from '@/lib/settings';
import { ADMIN_CONTENT_OPERATOR_USERNAMES } from '@/lib/admin-content';

export default async function AdminContentPage() {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const members = await getAdminUserSettingsView();
  const authorOptions = members
    .filter((member) => member.profile?.id && member.profile?.displayName && member.profile?.username)
    .filter((member) => ADMIN_CONTENT_OPERATOR_USERNAMES.includes(member.profile!.username.toLowerCase() as typeof ADMIN_CONTENT_OPERATOR_USERNAMES[number]))
    .map((member) => ({
      id: member.profile!.id,
      label: `${member.profile!.displayName} · @${member.profile!.username}`,
      city: member.profile?.city ?? 'Seoul',
    }));

  return (
    <AdminShell
      currentPath="/admin/content"
      title="Content operations"
      description="Create operator-seeded posts without weakening auth or sharing user credentials. Keep publishing deliberate, auditable, and admin-only."
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] xl:gap-6">
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-6">
          {authorOptions.length ? (
            <AdminSeedPostForm action={createAdminSeedPostAction} authors={authorOptions} />
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              No approved operator accounts are available yet. Create profiles with these usernames first: livingkoreateam, koreasetupdesk, communitysignal.
            </div>
          )}
        </div>
        <aside className="space-y-4">
          <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Guardrails</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
              <li>Use a small number of clearly platform-operated accounts.</li>
              <li>Seed useful Korea-specific posts, not fake crowd simulation.</li>
              <li>Keep titles practical and believable.</li>
              <li>Every admin-seeded post is logged to workflow and security events.</li>
            </ul>
          </section>
          <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Recommended account roles</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
              <li>Living In Korea Team, broad practical guidance</li>
              <li>Korea Setup Desk, visa and admin-heavy content</li>
              <li>Community Signal, meetups and local tips</li>
            </ul>
          </section>
        </aside>
      </section>
    </AdminShell>
  );
}
