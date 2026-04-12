import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { getFeedPosts } from '@/lib/data';
import { getCurrentMember } from '@/lib/auth';
import { getAccountSettings } from '@/lib/settings';

export default async function HomePage() {
  const member = await getCurrentMember();
  const [posts, accountSettings] = await Promise.all([
    getFeedPosts(),
    member ? getAccountSettings() : Promise.resolve(null),
  ]);
  const activeMembers = posts.filter((post) => post.author.onboardingCompleted).length;
  const visibleCities = new Set(posts.map((post) => post.city).filter(Boolean)).size;
  const recommendedCategory = accountSettings?.profile.immediateNeed || null;

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {member ? (
        <section className="rounded-[30px] border border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-cyan-50/60 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-sky-700">Home</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Latest posts</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {recommendedCategory ? `Your current need is ${recommendedCategory}. Start there, then widen out when you want broader context.` : 'Start with recent posts, then ask one useful question when you need help.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {recommendedCategory ? (
                <Link href={`/feed?category=${recommendedCategory}`} className="rounded-full border border-sky-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-white">
                  Open recommended feed
                </Link>
              ) : null}
              <Link href="/create" className="rounded-full bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-700">
                Ask a question
              </Link>
            </div>
          </div>
          {!accountSettings?.profile.immediateNeed || !accountSettings?.profile.occupation ? (
            <div className="mt-4 rounded-2xl border border-sky-200 bg-white/75 p-4 text-sm text-sky-950 shadow-sm">
              Add your city, occupation, and current need to make the feed more relevant.
              <Link href="/settings?onboarding=1" className="ml-2 font-medium text-sky-700 underline underline-offset-4">Finish onboarding</Link>
            </div>
          ) : null}
        </section>
      ) : (
        <>
          <section className="rounded-[2rem] bg-gradient-to-br from-white via-sky-50/70 to-cyan-50/70 p-6 shadow-sm ring-1 ring-sky-100">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-700">English-first community for life in Korea</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">High-signal local help for foreigners living across Korea.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Find housing leads, job context, and daily-life answers in one place, with visible profiles and moderated discussion instead of scattered chat noise.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/feed" className="rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white hover:bg-sky-700">
                Browse posts
              </Link>
              <Link href="/#signin" className="rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-white">
                Sign in to ask or reply
              </Link>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-sky-100">
                <p className="text-sm font-semibold text-slate-900">Visible member profiles</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Replies and posts stay tied to real community identities, not anonymous drops.</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-cyan-100">
                <p className="text-sm font-semibold text-slate-900">Published posts only</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Public feeds show published content, while reports and moderation stay operator-controlled.</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-sky-100">
                <p className="text-sm font-semibold text-slate-900">Korea-wide local context</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Seoul, Busan, Daegu, and flexible local areas are built into the posting flow.</p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[30px] border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/60 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-700">Community snapshot</p>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">{activeMembers}</span> members with onboarding completed</p>
                <p><span className="font-semibold text-slate-900">{posts.length}</span> published posts currently visible</p>
                <p><span className="font-semibold text-slate-900">{visibleCities}</span> city buckets represented</p>
              </div>
            </div>
            <div className="rounded-[30px] border border-sky-100 bg-gradient-to-br from-white to-sky-50/60 p-6 shadow-sm md:col-span-2">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-700">How to get value fast</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-slate-100">
                  <p className="text-sm font-semibold text-slate-900">Browse what people are asking now</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Start with recent posts to understand the tone, quality, and the kinds of help already flowing.</p>
                </div>
                <div className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-slate-100">
                  <p className="text-sm font-semibold text-slate-900">Set your city and current need</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">A little profile context makes the feed and future replies much more useful.</p>
                </div>
                <div className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-slate-100">
                  <p className="text-sm font-semibold text-slate-900">Ask one clear question</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">The fastest path to value is a specific question with enough context for someone local to answer well.</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <PageHeader
        eyebrow={member ? 'Latest posts' : 'Fresh in the feed'}
        title={member ? 'Recent community posts' : 'What foreigners in Korea need help with right now'}
        description={member ? 'Start here, then jump into a conversation or ask a focused question of your own.' : 'Start with the most useful recent posts, then join the conversation or add your own situation so the right people can help quickly.'}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {posts.slice(0, 6).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <section className="rounded-[30px] border border-sky-100 bg-gradient-to-r from-white to-sky-50/50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sky-700">Initial growth engine</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Start with the first 10 real users, then compound trust.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Keep the experience clean, city-aware, and useful enough that people come back because it saves time, not because it shouts.</p>
          </div>
          <Link href="/feed" className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-800">
            View feed <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
