import { PageHeader } from '@/components/page-header';
import { CreatePostClientShell } from '@/components/create-post-client-shell';
import { getCurrentMember } from '@/lib/auth';
import { createPostAction } from './actions';
import { SignInGuard } from '@/components/sign-in-guard';

export default async function CreatePostPage() {
  const member = await getCurrentMember();

  return (
    <div className="space-y-5 pb-24 lg:space-y-6 lg:pb-8">
      <PageHeader
        eyebrow="Create"
        title="Ask for help or share a useful lead"
        description="Be clear about your situation, location, and what kind of response you need. Good posts get useful replies faster."
      />
      <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/40 p-4 shadow-sm sm:p-6">
        {member ? (
          <>
            <div className="mb-4 rounded-2xl border border-sky-100 bg-white/80 p-4 text-sm text-slate-600 shadow-sm">
              <p className="font-semibold text-slate-900">Write for fast, useful replies</p>
              <p className="mt-1 leading-6">Lead with your city, timing, and what kind of help you want. Keep the ask specific.</p>
            </div>
            <CreatePostClientShell action={createPostAction} city={process.env.NEXT_PUBLIC_CITY ?? 'Seoul'} />
          </>
        ) : (
          <SignInGuard
            title="Create an account to post"
            description="Reading is open to everyone, but you need an account to post and get replies."
            ctaLabel="Create account or sign in"
            className="rounded-3xl border border-sky-200 bg-white/85 p-5 shadow-sm sm:p-6"
          />
        )}
      </section>
    </div>
  );
}
