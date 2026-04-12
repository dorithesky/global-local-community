import Link from 'next/link';
import { ArrowRight, Briefcase, Home, LifeBuoy } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { AuthButtons } from '@/components/auth-buttons';
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
          Housing, jobs, and daily-life answers in one AI-augmented community layer, starting with Seoul, Busan, Daegu, and everywhere else that still gets ignored.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/feed" className="rounded-full bg-sky-500 px-5 py-3 text-sm font-medium text-white hover:bg-sky-400">
            Join the community
          </Link>
          <Link href="/create" className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white hover:bg-white/10">
            Share a post
          </Link>
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
        title="What people are asking right now"
        description="Seeded with realistic expat problems so the platform feels alive from day one."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {posts.slice(0, 6).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-sky-600">Initial growth engine</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Start with the first 10 real users, then compound trust.</h2>
            </div>
            <Link href="/feed" className="inline-flex items-center gap-2 text-sm font-medium text-sky-700">
              View feed <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <AuthButtons />
      </section>
    </div>
  );
}
