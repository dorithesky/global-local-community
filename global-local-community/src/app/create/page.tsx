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
        title="Ask for help or share a useful lead"
        description="Be clear about your situation, location, and what kind of response you need. Good posts get useful replies faster."
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <CreatePostForm action={createPostAction} city={process.env.NEXT_PUBLIC_CITY ?? 'Seoul'} />
      </section>
    </div>
  );
}
