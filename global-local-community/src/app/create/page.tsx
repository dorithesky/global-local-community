import { classifyContent, detectToxicityOrSpam } from '@/lib/intelligence';
import { enqueueWorkflow, describeWorkflow } from '@/lib/orchestration';
import { PageHeader } from '@/components/page-header';

const sample = {
  title: 'Roommate needed near Daegu Station',
  body: 'Looking for a female roommate for a 2-room apartment with easy subway access and flexible move-in date.',
};

const contentAnalysis = classifyContent(sample);
const spamAnalysis = detectToxicityOrSpam(sample);
const workflow = enqueueWorkflow('post.created', { title: sample.title, city: 'Daegu' });

export default function CreatePostPage() {
  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Create"
        title="Publish a high-signal post"
        description="Post creation is intentionally simple, but the backend still runs AI classification, spam checks, and workflow orchestration."
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">Title</label>
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-sky-200 focus:ring" defaultValue={sample.title} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">Body</label>
            <textarea className="min-h-40 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-sky-200 focus:ring" defaultValue={sample.body} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Classification</p>
              <p className="mt-2">{contentAnalysis.label} • {contentAnalysis.score.toFixed(2)}</p>
              <p>{contentAnalysis.explanation}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Spam / toxicity check</p>
              <p className="mt-2">{spamAnalysis.label} • {spamAnalysis.score.toFixed(2)}</p>
              <p>{spamAnalysis.explanation}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            <p className="font-medium">Orchestration event queued</p>
            <p className="mt-1">{workflow.type} at {workflow.createdAt}</p>
            <ul className="mt-2 list-disc pl-5">
              {describeWorkflow(workflow).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
          <button className="rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white hover:bg-sky-700" type="button">
            Publish post
          </button>
        </form>
      </section>
    </div>
  );
}
