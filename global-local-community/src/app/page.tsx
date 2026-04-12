import Link from 'next/link';
import { ArrowRight, Briefcase, Home, LifeBuoy } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { getFeedPosts } from '@/lib/data';
import { getCurrentMember } from '@/lib/auth';
import { getAccountSettings, getAdminUserSettingsView } from '@/lib/settings';

const highlights = [
  { title: 'Housing without the chaos', description: 'Find reliable listings, deposit context, and neighborhood notes from people already here.', icon: Home },
  { title: 'Jobs with signal, not spam', description: 'Surface roles, referrals, and visa-aware hiring notes for foreigners in Korea.', icon: Briefcase },
  { title: 'Daily life made easier', description: 'Banking, hospitals, ARC updates, phone plans, and the little things that still eat your time.', icon: LifeBuoy },
];

export default async function HomePage() {
  const member = await getCurrentMember();
  const [posts, memberSettings, accountSettings] = await Promise.all([
    getFeedPosts(),
    getAdminUserSettingsView(),
    member ? getAccountSettings() : Promise.resolve(null),
  ]);
  const activeMembers = memberSettings.filter((row) => row.profile?.onboardingCompleted).length;
  const visibleCities = new Set(memberSettings.map((row) => row.profile?.city).filter(Boolean)).size;
  const sanctionedMembers = memberSettings.filter((row) => row.activeSanction).length;
  const recommendedCategory = accountSettings?.profile.immediateNeed || null;

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {member ? (
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-sky-600">Home</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Latest posts</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {recommendedCategory ? `Your current need is ${recommendedCategory}. Start there, then widen out when you want broader context.` : 'Start with recent posts, then ask one useful question when you need help.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {recommendedCategory ? (
                <Link href={`/feed?category=${recommendedCategory}`} className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Open recommended feed
                </Link>
              ) : null}
              <Link href="/create" className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
                Ask a question
              </Link>
            </div>
          </div>
          {!accountSettings?.profile.immediateNeed || !accountSettings?.profile.occupation ? (
            <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
              Add your city, occupation, and current need to make the feed more relevant.
              <Link href="/settings?onboarding=1" className="ml-2 font-medium text-sky-700 underline underline-offset-4">Finish onboarding</Link>
            </div>
          ) : null}
        </section>
      ) : (
        <>
          <section className="rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-sky-300">English-first community for life in Korea</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">High-signal local help for foreigners living across Korea.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              A trusted English-first community for foreigners living in Korea, built to help you solve housing, jobs, and daily-life problems faster than scattered group chats ever will.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/feed" className="rounded-full bg-sky-500 px-5 py-3 text-sm font-medium text-white hover:bg-sky-400">
                Browse trusted posts
              </Link>
              <Link href="/#signin" className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white hover:bg-white/10">
                Sign in and build your profile
              </Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Why this exists</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">Most foreigners in Korea still rely on scattered chats, stale spreadsheets, and partial advice. This product is built to reduce that drag.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Why join now</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">Early members shape the quality bar, city coverage, and the first trustworthy answer set that later users depend on.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300">What you get</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">Visible profiles, moderated discussion, and city-aware help that feels closer to a real community product than a noisy chat room.</p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-600">Trust signals</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Built to feel more trustworthy than a random group chat.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Visible profiles, moderation controls, and city-aware context are part of the product surface, not hidden promises.</p>
            </div>
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-600">Community snapshot</p>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">{activeMembers}</span> members with onboarding completed</p>
                <p><span className="font-semibold text-slate-900">{posts.length}</span> published posts currently visible</p>
                <p><span className="font-semibold text-slate-900">{visibleCities}</span> city buckets represented</p>
              </div>
            </div>
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-sky-600">Safety posture</p>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <p>Public feeds show published posts only.</p>
                <p>Reports and moderation actions are operator-gated.</p>
                <p>{sanctionedMembers ? `${sanctionedMembers} members currently restricted under moderation controls.` : 'No active member restrictions visible right now.'}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-600">Start here</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Get to the right part of the community fast</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">1. Choose your city</p>
                <p className="mt-2 text-sm text-slate-600">Tell the product where you live so Seoul, Busan, Daegu, and other local context feels relevant immediately.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">2. Pick what you need most</p>
                <p className="mt-2 text-sm text-slate-600">Housing, jobs, daily life, events, or marketplace. This should shape what you see first.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">3. Ask one useful question</p>
                <p className="mt-2 text-sm text-slate-600">Share your situation clearly and get practical replies from people already living in Korea.</p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <Icon className="h-5 w-5 text-sky-600" />
                  <h2 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              );
            })}
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

      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sky-600">Initial growth engine</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Start with the first 10 real users, then compound trust.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Keep the experience clean, city-aware, and useful enough that people come back because it saves time, not because it shouts.</p>
          </div>
          <Link href="/feed" className="inline-flex items-center gap-2 text-sm font-medium text-sky-700">
            View feed <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
