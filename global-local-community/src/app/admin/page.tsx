import { PageHeader } from '@/components/page-header';
import { drainWorkflowQueue, enqueueWorkflow } from '@/lib/orchestration';

enqueueWorkflow('report.created', { postId: 'post-3', reason: 'Potential misinformation' });
enqueueWorkflow('user.created', { userId: 'demo-user', city: 'Daegu' });
const events = drainWorkflowQueue();

export default function AdminPage() {
  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Admin"
        title="Moderation and workflow control"
        description="A lightweight moderation queue, designed so reports and onboarding tasks stay decoupled from the request path."
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Open moderation events</h2>
        <div className="mt-4 space-y-3">
          {events.map((event, index) => (
            <div key={`${event.type}-${index}`} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">{event.type}</p>
              <p className="mt-1">Created at {event.createdAt}</p>
              <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-900 p-3 text-xs text-slate-100">{JSON.stringify(event.payload, null, 2)}</pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
