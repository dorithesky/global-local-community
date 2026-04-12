import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { requireAdmin } from '@/lib/auth';
import { cityScopeLabel } from '@/lib/locations';
import { getAdminModerationView } from '@/lib/data';

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const { reports, recentPosts } = await getAdminModerationView();

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
                  <Link href={`/posts/${report.post.id}`} className="mt-3 inline-flex text-sm font-medium text-sky-700 hover:text-sky-800">
                    Open post
                  </Link>
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
    </div>
  );
}
