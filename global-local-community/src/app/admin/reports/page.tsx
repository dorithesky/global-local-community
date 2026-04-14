import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { AdminShell } from '@/components/admin-shell';
import { ModeratorNoteForm, PostVisibilityForm, ReportStatusForm, UserSanctionForm } from '@/components/admin-actions';
import { requireModerator } from '@/lib/auth';
import { getAdminModerationView } from '@/lib/data';
import { cityScopeLabel } from '@/lib/locations';
import { addModeratorNoteAction, applyUserSanctionAction, setReportedPostVisibilityAction, updateReportStatusAction } from '../actions';

type ReportedPost = {
  id: string;
  author_id: string;
  category: string;
  title: string;
  body: string;
  city?: string | null;
  district?: string | null;
};

type ReportedComment = {
  id: string;
  post_id: string;
  author_id: string;
  body?: string | null;
  deleted_at?: string | null;
};

export default async function AdminReportsPage() {
  noStore();
  const moderator = await requireModerator();
  if (!moderator) notFound();

  const { reports } = await getAdminModerationView();

  return (
    <AdminShell
      currentPath="/admin/reports"
      title="Reports"
      description="Review reported posts and comments, then take action when needed."
    >
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Moderation queue</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">Open reports</h2>
          </div>
          <p className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-600">{reports.length} reports</p>
        </div>
        <div className="mt-4 space-y-3">
          {reports.length ? reports.map((report) => {
            const post = report.post as unknown as ReportedPost | null;
            const comment = report.comment as unknown as ReportedComment | null;

            return (
              <div key={report.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium capitalize text-slate-900">{report.reason}</p>
                  <span>•</span>
                  <span>{report.status}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                </div>
                {report.details ? <p className="mt-2">{report.details}</p> : null}
                {post ? (
                  <div className="mt-3 rounded-2xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/30 p-4 sm:p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-sky-600">Reported post</p>
                    <p className="mt-2 font-medium text-slate-900">{post.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{post.category} • {cityScopeLabel(post.city, post.district)}</p>
                    <p className="mt-2 line-clamp-2">{post.body}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link href={`/posts/${post.id}`} className="inline-flex text-sm font-medium text-sky-700 hover:text-sky-800">Open post</Link>
                      <ReportStatusForm reportId={report.id} status="reviewing" action={updateReportStatusAction} />
                      <ReportStatusForm reportId={report.id} status="resolved" action={updateReportStatusAction} />
                      <PostVisibilityForm postId={post.id} moderationStatus="published" action={setReportedPostVisibilityAction} />
                      <PostVisibilityForm postId={post.id} moderationStatus="hidden" action={setReportedPostVisibilityAction} />
                    </div>
                    <div className="mt-3 space-y-2">
                      <ModeratorNoteForm action={addModeratorNoteAction} reportId={report.id} postId={post.id} targetUserId={post.author_id} />
                      <UserSanctionForm action={applyUserSanctionAction} userId={post.author_id} />
                    </div>
                  </div>
                ) : comment ? (
                  <div className="mt-3 rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/30 p-4 sm:p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-amber-600">Reported comment</p>
                    <p className="mt-2 line-clamp-3 text-slate-700">{comment.deleted_at ? 'Comment already deleted' : comment.body}</p>
                    <p className="mt-2 text-xs text-slate-500">Comment id: {comment.id}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link href={`/posts/${comment.post_id}`} className="inline-flex text-sm font-medium text-sky-700 hover:text-sky-800">Open parent post</Link>
                      <ReportStatusForm reportId={report.id} status="reviewing" action={updateReportStatusAction} />
                      <ReportStatusForm reportId={report.id} status="resolved" action={updateReportStatusAction} />
                    </div>
                    <div className="mt-3 space-y-2">
                      <ModeratorNoteForm action={addModeratorNoteAction} reportId={report.id} commentId={comment.id} targetUserId={comment.author_id} />
                      <UserSanctionForm action={applyUserSanctionAction} userId={comment.author_id} />
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">Reported item unavailable.</p>
                )}
              </div>
            );
          }) : <p className="text-sm text-slate-500">No open reports yet.</p>}
        </div>
      </section>
    </AdminShell>
  );
}
