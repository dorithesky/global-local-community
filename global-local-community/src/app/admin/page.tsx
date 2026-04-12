import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { requireAdmin } from '@/lib/auth';
import { getAdminUserSettingsView } from '@/lib/settings';

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const userSettings = await getAdminUserSettingsView();
  const sanctionedMembers = userSettings.filter((setting) => Boolean(setting.activeSanction));
  const onboardingIncompleteMembers = userSettings.filter((setting) => !setting.profile?.onboardingCompleted);
  const membersNeedingProfileCompletion = userSettings.filter((setting) => !setting.profile?.city || !setting.profile?.occupation || !setting.immediate_need);
  const attentionItems = [
    {
      label: 'Members missing onboarding completion',
      value: onboardingIncompleteMembers.length,
      tone: onboardingIncompleteMembers.length ? 'sky' : 'slate',
      href: '/admin/members?status=onboarding-incomplete',
      description: 'Members who still need first-run setup follow-up.',
    },
    {
      label: 'Members with active sanctions',
      value: sanctionedMembers.length,
      tone: sanctionedMembers.length ? 'amber' : 'slate',
      href: '/admin/members?status=sanctioned',
      description: 'Restricted accounts that may need review or follow-up.',
    },
    {
      label: 'Members with profile gaps',
      value: membersNeedingProfileCompletion.length,
      tone: membersNeedingProfileCompletion.length ? 'rose' : 'slate',
      href: '/admin/members',
      description: 'Profiles missing city, occupation, or immediate need context.',
    },
  ];

  return (
    <AdminShell
      currentPath="/admin"
      title="Operations overview"
      description="High-level community state for admins, with quick visibility into privileged roles, moderation pressure, and member onboarding health."
    >
      <section className="grid gap-6 xl:grid-cols-[repeat(3,minmax(0,1fr))]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Members</p>
          <p className="mt-3 text-4xl font-semibold text-slate-900">{userSettings.length}</p>
          <p className="mt-2 text-sm text-slate-500">Total known member records across the current community.</p>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Needs review</p>
          <p className="mt-3 text-4xl font-semibold text-amber-950">{sanctionedMembers.length + onboardingIncompleteMembers.length}</p>
          <p className="mt-2 text-sm text-amber-800">Combined sanction and onboarding follow-up pressure.</p>
        </div>
        <div className="rounded-3xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Member health</p>
          <p className="mt-3 text-4xl font-semibold text-sky-950">{Math.max(userSettings.length - membersNeedingProfileCompletion.length, 0)}</p>
          <p className="mt-2 text-sm text-sky-800">Members with enough basic profile context to operate cleanly.</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Needs attention</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Operational exceptions</h2>
              <p className="mt-1 text-sm text-slate-500">Only the issues that deserve immediate admin review live here.</p>
            </div>
            <a href="/admin/members" className="text-sm font-medium text-sky-700 hover:text-sky-800">Open member operations</a>
          </div>

          <div className="mt-4 space-y-3">
            {attentionItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`block rounded-2xl border p-4 transition hover:bg-white ${item.tone === 'amber' ? 'border-amber-200 bg-amber-50' : item.tone === 'sky' ? 'border-sky-200 bg-sky-50' : item.tone === 'rose' ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  </div>
                  <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick links</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">Open a workspace</h2>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <a href="/admin/reports" className="block rounded-2xl bg-slate-50 px-4 py-3 text-slate-700 hover:bg-slate-100">Reports queue</a>
              <a href="/admin/members" className="block rounded-2xl bg-slate-50 px-4 py-3 text-slate-700 hover:bg-slate-100">Members</a>
              <a href="/admin/activity" className="block rounded-2xl bg-slate-50 px-4 py-3 text-slate-700 hover:bg-slate-100">Activity log</a>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Overview note</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Keep this page light</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Detailed moderation queues, full member lists, and long audit trails now belong to their dedicated admin routes. This overview should stay focused on summary and exceptions.</p>
          </section>
        </div>
      </section>
    </AdminShell>
  );
}
