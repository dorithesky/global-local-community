import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { PostVisibilityForm, ReportStatusForm } from '@/components/admin-actions';
import { requireAdmin } from '@/lib/auth';
import { getAdminModerationView } from '@/lib/data';
import { cityScopeLabel } from '@/lib/locations';
import { getAdminUserSettingsView } from '@/lib/settings';
import { setReportedPostVisibilityAction, updateReportStatusAction } from './actions';

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const { reports, recentPosts, commentHistory = [] } = await getAdminModerationView();
  const userSettings = await getAdminUserSettingsView();

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Admin"
        title="Moderation and workflow control"
        description="Private moderation space for trusted admins only, with enough context to make quick decisions."
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Open reports</h2>
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
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">Post details unavailable, id: {report.post_id}</p>
              )}
            </div>
          )) : <p className="text-sm text-slate-500">No open reports yet.</p>}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent posts</h2>
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

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Comment history</h2>
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

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">User communication settings</h2>
        <div className="mt-4 space-y-3">
          {userSettings.length ? userSettings.map((setting) => (
            <div key={setting.user_id} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">{setting.profile?.displayName ?? 'Unknown member'} {setting.profile?.username ? `(@${setting.profile.username})` : ''}</p>
              <p className="mt-1 text-xs text-slate-500">{setting.user_id}</p>
              <p className="mt-2">Likes notifications: {setting.notify_likes ? 'On' : 'Off'}</p>
              <p>Comments notifications: {setting.notify_comments ? 'On' : 'Off'}</p>
              <p>Marketing consent: {setting.marketing_consent ? 'Yes' : 'No'}</p>
              <p>Third-party email consent: {setting.third_party_email_consent ? 'Yes' : 'No'}</p>
            </div>
          )) : <p className="text-sm text-slate-500">No user settings saved yet.</p>}
        </div>
      </section>
    </div>
  );
}
