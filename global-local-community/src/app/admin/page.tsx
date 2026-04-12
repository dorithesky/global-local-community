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
  const adminRoleMembers = userSettings.filter((setting) => setting.roles.includes('admin'));
  const moderatorRoleMembers = userSettings.filter((setting) => setting.roles.includes('moderator'));
  const recentSanctionedMembers = sanctionedMembers.slice(0, 5);
  const recentOnboardingGaps = onboardingIncompleteMembers.slice(0, 5);

  return (
    <AdminShell
      currentPath="/admin"
      title="Operations overview"
      description="High-level community state for admins, with quick visibility into privileged roles, moderation pressure, and member onboarding health."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Members</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{userSettings.length}</p>
          <p className="mt-2 text-sm text-slate-500">Known member records available to admin.</p>
        </div>
        <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Privileged roles</p>
          <p className="mt-3 text-3xl font-semibold text-violet-950">{adminRoleMembers.length + moderatorRoleMembers.length}</p>
          <p className="mt-2 text-sm text-violet-800">Admins: {adminRoleMembers.length} • Moderators: {moderatorRoleMembers.length}</p>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Active sanctions</p>
          <p className="mt-3 text-3xl font-semibold text-amber-950">{sanctionedMembers.length}</p>
          <p className="mt-2 text-sm text-amber-800">Members currently restricted and worth monitoring closely.</p>
        </div>
        <div className="rounded-3xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Onboarding incomplete</p>
          <p className="mt-3 text-3xl font-semibold text-sky-950">{onboardingIncompleteMembers.length}</p>
          <p className="mt-2 text-sm text-sky-800">Members who still have not completed first-run profile setup.</p>
        </div>
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Profile gaps</p>
          <p className="mt-3 text-3xl font-semibold text-rose-950">{membersNeedingProfileCompletion.length}</p>
          <p className="mt-2 text-sm text-rose-800">Members missing city, occupation, or immediate need context.</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">What to open next</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Operational shortcuts</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <a href="/admin/reports" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white">
              <p className="font-medium text-slate-900">Reports queue</p>
              <p className="mt-1 text-sm text-slate-500">Review and resolve reported posts and comments.</p>
            </a>
            <a href="/admin/members" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white">
              <p className="font-medium text-slate-900">Members</p>
              <p className="mt-1 text-sm text-slate-500">Search members, inspect roles, and apply sanctions.</p>
            </a>
            <a href="/admin/activity" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white">
              <p className="font-medium text-slate-900">Activity log</p>
              <p className="mt-1 text-sm text-slate-500">Audit comment history and recent community actions.</p>
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin watchlist</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Sanctions</h2>
            <div className="mt-4 space-y-2">
              {recentSanctionedMembers.length ? recentSanctionedMembers.map((setting) => (
                <div key={`sanction-${setting.user_id}`} className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-medium">{setting.profile?.displayName ?? 'Unknown member'}</p>
                  <p className="mt-1 text-xs text-amber-800">{setting.activeSanction?.type} • {setting.activeSanction?.reason}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No active sanctions right now.</p>}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin watchlist</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Onboarding follow-up</h2>
            <div className="mt-4 space-y-2">
              {recentOnboardingGaps.length ? recentOnboardingGaps.map((setting) => (
                <div key={`onboarding-${setting.user_id}`} className="rounded-2xl bg-sky-50 p-3 text-sm text-sky-950">
                  <p className="font-medium">{setting.profile?.displayName ?? 'Unknown member'}</p>
                  <p className="mt-1 text-xs text-sky-800">Need: {setting.immediate_need ?? 'Not set'} • Occupation: {setting.profile?.occupation ?? 'Not set'}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No onboarding follow-up needed right now.</p>}
            </div>
          </section>
        </div>
      </section>
    </AdminShell>
  );
}
