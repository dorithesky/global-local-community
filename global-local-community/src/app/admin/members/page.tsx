import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { AdminShell } from '@/components/admin-shell';
import { UserSanctionForm } from '@/components/admin-actions';
import { requireAdmin } from '@/lib/auth';
import { getAdminUserSettingsView } from '@/lib/settings';
import { applyUserSanctionAction } from '../actions';

export default async function AdminMembersPage({ searchParams }: { searchParams?: Promise<{ q?: string; city?: string; status?: string }> }) {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const userSettings = await getAdminUserSettingsView();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = (resolvedSearchParams?.q ?? '').trim().toLowerCase();
  const cityFilter = (resolvedSearchParams?.city ?? '').trim();
  const statusFilter = (resolvedSearchParams?.status ?? '').trim();

  const filteredUserSettings = userSettings.filter((setting) => {
    const haystack = [
      setting.profile?.displayName,
      setting.profile?.username,
      setting.profile?.city,
      setting.profile?.occupation,
      setting.origin_country,
      setting.life_stage,
      setting.immediate_need,
      setting.activeSanction?.reason,
      setting.activeSanction?.type,
      setting.user_id,
      ...(setting.roles ?? []),
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesQuery = !query || haystack.includes(query);
    const matchesCity = !cityFilter || (setting.profile?.city ?? 'Unknown') === cityFilter;
    const matchesStatus = !statusFilter
      || (statusFilter === 'sanctioned' && Boolean(setting.activeSanction))
      || (statusFilter === 'onboarding-incomplete' && !setting.profile?.onboardingCompleted)
      || (statusFilter === 'clear' && !setting.activeSanction);

    return matchesQuery && matchesCity && matchesStatus;
  });

  return (
    <AdminShell
      currentPath="/admin/members"
      title="Member operations"
      description="Search members, inspect identity and role context, and apply operational restrictions from one focused workspace."
    >
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Members</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Search and manage members</h2>
            <p className="mt-1 text-sm text-slate-500">Use filters to narrow the operational list quickly.</p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredUserSettings.length}</span> of {userSettings.length} members
          </div>
        </div>

        <form className="mt-5 grid gap-3 rounded-2xl border-2 border-sky-100 bg-sky-50 p-4 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]">
          <input type="text" name="q" defaultValue={resolvedSearchParams?.q ?? ''} placeholder="Search by name, username, city, role, sanction, need, or user id" className="rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring" />
          <select name="city" defaultValue={cityFilter} className="rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring">
            <option value="">All cities</option>
            <option value="Seoul">Seoul</option>
            <option value="Busan">Busan</option>
            <option value="Daegu">Daegu</option>
            <option value="Other">Other</option>
            <option value="Unknown">Unknown</option>
          </select>
          <select name="status" defaultValue={statusFilter} className="rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring">
            <option value="">All member states</option>
            <option value="clear">No active sanction</option>
            <option value="sanctioned">Active sanction</option>
            <option value="onboarding-incomplete">Onboarding incomplete</option>
          </select>
          <button type="submit" className="rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white hover:bg-sky-700">Filter</button>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <p>Member search is isolated here so it stays visible and useful at operational scale.</p>
          {(query || cityFilter || statusFilter) ? <Link href="/admin/members" className="font-medium text-sky-700 hover:text-sky-800">Clear filters</Link> : null}
        </div>

        <div className="mt-4 space-y-3">
          {filteredUserSettings.length ? filteredUserSettings.map((setting) => (
            <div key={setting.user_id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{setting.profile?.displayName ?? 'Unknown member'} {setting.profile?.username ? `(@${setting.profile.username})` : ''}</p>
                  <p className="mt-1 text-xs text-slate-500">User id: {setting.user_id}</p>
                  <p className="mt-1 text-xs text-slate-500">City: {setting.profile?.city ?? 'Unknown'} • Occupation: {setting.profile?.occupation ?? 'Not set'}</p>
                  <p className="mt-1 text-xs text-slate-500">Origin country: {setting.origin_country ?? 'Not set'} • Life stage: {setting.life_stage ?? 'Not set'} • Immediate need: {setting.immediate_need ?? 'Not set'}</p>
                  <p className="mt-1 text-xs text-slate-500">Onboarding completed: {setting.profile?.onboardingCompleted ? 'Yes' : 'No'} • Joined: {setting.profile?.createdAt ? formatDistanceToNow(new Date(setting.profile.createdAt), { addSuffix: true }) : 'Unknown'}</p>
                  <p className="mt-1 text-xs text-slate-500">Roles: {setting.roles.length ? setting.roles.join(', ') : 'member'} • Active sanction: {setting.activeSanction ? `${setting.activeSanction.type} (${setting.activeSanction.reason})` : 'None'}</p>
                </div>
                {setting.profile?.username ? <Link href={`/profile/${setting.profile.username}`} className="text-sm font-medium text-sky-700 hover:text-sky-800">Open profile</Link> : null}
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <p>Likes notifications: {setting.notify_likes ? 'On' : 'Off'}</p>
                <p>Comments notifications: {setting.notify_comments ? 'On' : 'Off'}</p>
                <p>Marketing consent: {setting.marketing_consent ? 'Yes' : 'No'}</p>
                <p>Third-party email consent: {setting.third_party_email_consent ? 'Yes' : 'No'}</p>
              </div>
              <div className="mt-3">
                <UserSanctionForm action={applyUserSanctionAction} userId={setting.user_id} />
              </div>
            </div>
          )) : <p className="text-sm text-slate-500">No members matched the current filters.</p>}
        </div>
      </section>
    </AdminShell>
  );
}
