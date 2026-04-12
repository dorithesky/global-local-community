import Link from 'next/link';
import { ArrowRight, Briefcase, Home, LifeBuoy } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { getFeedPosts } from '@/lib/data';

const highlights = [
  { title: 'Housing without the chaos', description: 'Find reliable listings, deposit context, and neighborhood notes from people already here.', icon: Home },
  { title: 'Jobs with signal, not spam', description: 'Surface roles, referrals, and visa-aware hiring notes for foreigners in Korea.', icon: Briefcase },
  { title: 'Daily life made easier', description: 'Banking, hospitals, ARC updates, phone plans, and the little things that still eat your time.', icon: LifeBuoy },
];

export default async function HomePage() {
  const posts = await getFeedPosts();

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
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
          <Link href="/settings" className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white hover:bg-white/10">
            Set your city and needs first
          </Link>
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

      <PageHeader
        eyebrow="Fresh in the feed"
        title="What foreigners in Korea need help with right now"
        description="Start with the most useful recent posts, then join the conversation or add your own situation so the right people can help quickly."
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
