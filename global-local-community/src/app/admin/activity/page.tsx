import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { AdminShell } from '@/components/admin-shell';
import { requireAdmin } from '@/lib/auth';
import { getAdminModerationView } from '@/lib/data';
import { cityScopeLabel } from '@/lib/locations';

export default async function AdminActivityPage() {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const { recentPosts, commentHistory = [] } = await getAdminModerationView();

  return (
    <AdminShell
      currentPath="/admin/activity"
      title="Activity and audit trail"
      description="Review recent community activity and inspect comment history without competing with moderation or member management controls."
    >
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
                  <Link href={`/posts/${post.id}`} className="text-sm font-medium text-sky-700 hover:text-sky-800">View</Link>
                </div>
                <p className="mt-2 line-clamp-2">{post.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
      </section>
    </AdminShell>
  );
}
