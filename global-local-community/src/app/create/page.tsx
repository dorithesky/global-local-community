import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { CreatePostForm } from '@/components/create-post-form';
import { getCurrentMember } from '@/lib/auth';
import { createPostAction } from './actions';

export default async function CreatePostPage() {
  const member = await getCurrentMember();

  if (!member) {
    redirect('/#signin');
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Create"
        title="Publish a high-signal post"
        description="Simple for the member, structured behind the scenes. Classification, spam checks, and workflow metadata all happen automatically."
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <CreatePostForm action={createPostAction} city={process.env.NEXT_PUBLIC_CITY ?? 'Daegu'} />
      </section>
    </div>
  );
}
