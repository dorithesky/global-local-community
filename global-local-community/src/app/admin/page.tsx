import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { cityScopeLabel } from '@/lib/locations';
import { getAdminModerationView } from '@/lib/data';

export default async function AdminPage() {
  const { reports, recentPosts } = await getAdminModerationView();

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Admin"
        title="Moderation and workflow control"
        description="Real reports and recent posts, with just enough workflow structure to keep moderation practical."
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Open reports</h2>
        <div className="mt-4 space-y-3">
          {reports.length ? reports.map((report) => (
            <div key={report.id} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-slate-900">{report.reason}</p>
                <span>•</span>
                <span>{report.status}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
              </div>
              {report.details ? <p className="mt-2">{report.details}</p> : null}
              <p className="mt-2 text-xs text-slate-500">post_id: {report.post_id}</p>
            </div>
          )) : <p className="text-sm text-slate-500">No open reports yet.</p>}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent posts</h2>
        <div className="mt-4 space-y-3">
          {recentPosts.map((post) => (
            <div key={post.id} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">{post.title}</p>
              <p className="mt-1">{post.category} • {cityScopeLabel(post.city, post.district)}</p>
              <p className="mt-2 line-clamp-2">{post.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
