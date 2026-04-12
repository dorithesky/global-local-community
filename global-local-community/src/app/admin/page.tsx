import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { ModeratorNoteForm, PostVisibilityForm, ReportStatusForm, UserSanctionForm } from '@/components/admin-actions';
import { requireAdmin } from '@/lib/auth';
import { getAdminModerationView } from '@/lib/data';
import { cityScopeLabel } from '@/lib/locations';
import { getAdminUserSettingsView } from '@/lib/settings';
import { addModeratorNoteAction, applyUserSanctionAction, setReportedPostVisibilityAction, updateReportStatusAction } from './actions';

export default async function AdminPage({ searchParams }: { searchParams?: Promise<{ q?: string; city?: string; status?: string }> }) {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const { reports, recentPosts, commentHistory = [] } = await getAdminModerationView();
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
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesQuery = !query || haystack.includes(query);
    const matchesCity = !cityFilter || (setting.profile?.city ?? 'Unknown') === cityFilter;
    const matchesStatus = !statusFilter
      || (statusFilter === 'sanctioned' && Boolean(setting.activeSanction))
      || (statusFilter === 'onboarding-incomplete' && !setting.profile?.onboardingCompleted)
      || (statusFilter === 'clear' && !setting.activeSanction);

    return matchesQuery && matchesCity && matchesStatus;
  });

  const sanctionedMembers = userSettings.filter((setting) => Boolean(setting.activeSanction));
  const onboardingIncompleteMembers = userSettings.filter((setting) => !setting.profile?.onboardingCompleted);
  const membersNeedingProfileCompletion = userSettings.filter((setting) => !setting.profile?.city || !setting.profile?.occupation || !setting.immediate_need);
  const adminRoleMembers = userSettings.filter((setting) => setting.roles.includes('admin'));
  const moderatorRoleMembers = userSettings.filter((setting) => setting.roles.includes('moderator'));
  const recentSanctionedMembers = sanctionedMembers.slice(0, 5);
  const recentOnboardingGaps = onboardingIncompleteMembers.slice(0, 5);

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Admin"
        title="Moderation and workflow control"
        description="Private moderation space for trusted admins only, with enough context to make quick decisions."
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-slate-900">Sections</span>
          <a href="#overview" className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200">Overview</a>
          <a href="#moderation-queue" className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200">Moderation queue</a>
          <a href="#member-operations" className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200">Member operations</a>
          <a href="#community-activity" className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200">Community activity</a>
          <a href="#audit-trail" className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200">Audit trail</a>
        </div>
      </section>

      <section id="overview" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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

      <section id="moderation-queue" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Moderation queue</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Open reports</h2>
            <p className="mt-1 text-sm text-slate-500">Handle reported posts and comments, resolve cases, and take moderation actions without leaving the dashboard.</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {reports.length ? reports.map((report) => (
            <div key={report.id} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium capitalize text-slate-900">{report.reason}</p>
                <span>•</span>
                <span>{report.status}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
              </div>
              {report.details ? <p className="mt-2">{report.details}</p> : null}
              {report.post ? (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-600">Reported post</p>
                  <p className="mt-2 font-medium text-slate-900">{report.post.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{report.post.category} • {cityScopeLabel(report.post.city, report.post.district)}</p>
                  <p className="mt-2 line-clamp-2">{report.post.body}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link href={`/posts/${report.post.id}`} className="inline-flex text-sm font-medium text-sky-700 hover:text-sky-800">
                      Open post
                    </Link>
                    <ReportStatusForm reportId={report.id} status="reviewing" action={updateReportStatusAction} />
                    <ReportStatusForm reportId={report.id} status="resolved" action={updateReportStatusAction} />
                    <PostVisibilityForm postId={report.post.id} moderationStatus="published" action={setReportedPostVisibilityAction} />
                    <PostVisibilityForm postId={report.post.id} moderationStatus="hidden" action={setReportedPostVisibilityAction} />
                  </div>
                  <div className="mt-3 space-y-2">
                    <ModeratorNoteForm action={addModeratorNoteAction} reportId={report.id} postId={report.post.id} targetUserId={report.post.author_id} />
                    <UserSanctionForm action={applyUserSanctionAction} userId={report.post.author_id} />
                  </div>
                </div>
              ) : report.comment ? (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-600">Reported comment</p>
                  <p className="mt-2 line-clamp-3 text-slate-700">{report.comment.deleted_at ? 'Comment already deleted' : report.comment.body}</p>
                  <p className="mt-2 text-xs text-slate-500">Comment id: {report.comment.id}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link href={`/posts/${report.comment.post_id}`} className="inline-flex text-sm font-medium text-sky-700 hover:text-sky-800">
                      Open parent post
                    </Link>
                    <ReportStatusForm reportId={report.id} status="reviewing" action={updateReportStatusAction} />
                    <ReportStatusForm reportId={report.id} status="resolved" action={updateReportStatusAction} />
                  </div>
                  <div className="mt-3 space-y-2">
                    <ModeratorNoteForm action={addModeratorNoteAction} reportId={report.id} commentId={report.comment.id} targetUserId={report.comment.author_id} />
                    <UserSanctionForm action={applyUserSanctionAction} userId={report.comment.author_id} />
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">Reported item unavailable.</p>
              )}
            </div>
          )) : <p className="text-sm text-slate-500">No open reports yet.</p>}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div id="member-operations" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Member operations</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Members and communication settings</h2>
          <p className="mt-1 text-sm text-slate-500">Search, filter, inspect, and sanction members from one place.</p>
          <form className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]">
            <input
              type="text"
              name="q"
              defaultValue={resolvedSearchParams?.q ?? ''}
              placeholder="Search name, username, city, need, sanction, or user id"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring"
            />
            <select name="city" defaultValue={cityFilter} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring">
              <option value="">All cities</option>
              <option value="Seoul">Seoul</option>
              <option value="Busan">Busan</option>
              <option value="Daegu">Daegu</option>
              <option value="Other">Other</option>
              <option value="Unknown">Unknown</option>
            </select>
            <select name="status" defaultValue={statusFilter} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring">
              <option value="">All member states</option>
              <option value="clear">No active sanction</option>
              <option value="sanctioned">Active sanction</option>
              <option value="onboarding-incomplete">Onboarding incomplete</option>
            </select>
            <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
              Filter
            </button>
          </form>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <p>Showing {filteredUserSettings.length} of {userSettings.length} members.</p>
            {(query || cityFilter || statusFilter) ? (
              <Link href="/admin" className="font-medium text-sky-700 hover:text-sky-800">Clear filters</Link>
            ) : null}
          </div>
          <div className="mt-4 space-y-3">
            {filteredUserSettings.length ? filteredUserSettings.map((setting) => (
              <div key={setting.user_id} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{setting.profile?.displayName ?? 'Unknown member'} {setting.profile?.username ? `(@${setting.profile.username})` : ''}</p>
                    <p className="mt-1 text-xs text-slate-500">User id: {setting.user_id}</p>
                    <p className="mt-1 text-xs text-slate-500">City: {setting.profile?.city ?? 'Unknown'} • Occupation: {setting.profile?.occupation ?? 'Not set'}</p>
                    <p className="mt-1 text-xs text-slate-500">Origin country: {setting.origin_country ?? 'Not set'} • Life stage: {setting.life_stage ?? 'Not set'} • Immediate need: {setting.immediate_need ?? 'Not set'}</p>
                    <p className="mt-1 text-xs text-slate-500">Onboarding completed: {setting.profile?.onboardingCompleted ? 'Yes' : 'No'} • Joined: {setting.profile?.createdAt ? formatDistanceToNow(new Date(setting.profile.createdAt), { addSuffix: true }) : 'Unknown'}</p>
                    <p className="mt-1 text-xs text-slate-500">Roles: {setting.roles.length ? setting.roles.join(', ') : 'member'} • Active sanction: {setting.activeSanction ? `${setting.activeSanction.type} (${setting.activeSanction.reason})` : 'None'}</p>
                  </div>
                  {setting.profile?.username ? (
                    <Link href={`/profile/${setting.profile.username}`} className="text-sm font-medium text-sky-700 hover:text-sky-800">
                      Open profile
                    </Link>
                  ) : null}
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
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin-only watchlist</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Sanctions and onboarding follow-up</h2>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-900">Recently sanctioned members</p>
                <div className="mt-2 space-y-2">
                  {recentSanctionedMembers.length ? recentSanctionedMembers.map((setting) => (
                    <div key={`sanction-${setting.user_id}`} className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">
                      <p className="font-medium">{setting.profile?.displayName ?? 'Unknown member'} {setting.profile?.username ? `(@${setting.profile.username})` : ''}</p>
                      <p className="mt-1 text-xs text-amber-800">{setting.activeSanction?.type} • {setting.activeSanction?.reason}</p>
                      <p className="mt-1 text-xs text-amber-700">Role: {setting.roles.length ? setting.roles.join(', ') : 'member'}</p>
                    </div>
                  )) : <p className="text-sm text-slate-500">No active sanctions right now.</p>}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Members needing onboarding follow-up</p>
                <div className="mt-2 space-y-2">
                  {recentOnboardingGaps.length ? recentOnboardingGaps.map((setting) => (
                    <div key={`onboarding-${setting.user_id}`} className="rounded-2xl bg-sky-50 p-3 text-sm text-sky-950">
                      <p className="font-medium">{setting.profile?.displayName ?? 'Unknown member'} {setting.profile?.username ? `(@${setting.profile.username})` : ''}</p>
                      <p className="mt-1 text-xs text-sky-800">City: {setting.profile?.city ?? 'Unknown'} • Need: {setting.immediate_need ?? 'Not set'} • Occupation: {setting.profile?.occupation ?? 'Not set'}</p>
                      <p className="mt-1 text-xs text-sky-700">Role: {setting.roles.length ? setting.roles.join(', ') : 'member'}</p>
                    </div>
                  )) : <p className="text-sm text-slate-500">No onboarding follow-up needed right now.</p>}
                </div>
              </div>
            </div>
          </section>

          <section id="community-activity" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Community activity</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Recent posts</h2>
            <div className="mt-4 space-y-3">
              {recentPosts.map((post) => (
            <div key={post.id} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{post.title}</p>
                  <p className="mt-1">{post.category} • {cityScopeLabel(post.city, post.district)}</p>
                </div>
                <Link href={`/posts/${post.id}`} className="text-sm font-medium text-sky-700 hover:text-sky-800">
                  View
                </Link>
              </div>
              <p className="mt-2 line-clamp-2">{post.body}</p>
            </div>
              ))}
            </div>
          </section>

          <section id="audit-trail" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Audit trail</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Comment history</h2>
            <div className="mt-4 space-y-3">
              {commentHistory.length ? commentHistory.map((event) => (
            <div key={event.id} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium capitalize text-slate-900">{event.eventType}</p>
                <span>•</span>
                <span>{event.actor ? `${event.actor.displayName} (@${event.actor.username})` : 'Unknown member'}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}</span>
              </div>
              {event.newBody ? <p className="mt-2">New: {event.newBody}</p> : null}
              {event.oldBody ? <p className="mt-1 text-xs text-slate-500">Previous: {event.oldBody}</p> : null}
            </div>
              )) : <p className="text-sm text-slate-500">No comment history yet.</p>}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
