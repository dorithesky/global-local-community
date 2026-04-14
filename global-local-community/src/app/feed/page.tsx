import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { FeedFilters } from '@/components/feed-filters';
import { FeedPostList } from '@/components/feed-post-list';
import { getPaginatedFeedPosts, getTrendingPostsByCategory } from '@/lib/data';
import { getCurrentMember } from '@/lib/auth';
import { getAccountSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Feed',
  description: 'Browse the latest housing, jobs, daily life, and event posts from foreigners living across Korea.',
  alternates: {
    canonical: '/feed',
  },
};

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ city?: string; category?: string; q?: string; sort?: string }> }) {
  const params = await searchParams;
  const member = await getCurrentMember();
  const settings = member ? await getAccountSettings() : null;
  const feed = await getPaginatedFeedPosts({ city: params.city, category: params.category, query: params.q, sort: params.sort, page: 1, limit: 10 });
  const onboardingReady = Boolean(
    settings?.profile.city || settings?.profile.occupation || settings?.profile.originCountry || settings?.profile.lifeStage || settings?.profile.immediateNeed,
  );
  const recommendedCategory = settings?.profile.immediateNeed || null;
  const recommendedPosts = recommendedCategory ? await getTrendingPostsByCategory(recommendedCategory, 2) : [];

  return (
    <div className="space-y-3 pb-24 lg:pb-8">
      <PageHeader
        title="Latest posts"
        description="Housing, jobs, and daily-life questions from across Korea."
      />
      {member && !onboardingReady ? (
        <section className="rounded-3xl border border-sky-200 bg-sky-50 p-3.5 text-sm text-sky-950 shadow-sm sm:p-4">
          <p className="font-semibold">Complete your profile</p>
          <p className="mt-1.5 leading-5">Add your city and current need to improve the feed.</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <Link href="/settings?onboarding=1" className="min-h-11 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Finish onboarding</Link>
            <Link href="/create" className="min-h-11 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-white">Ask a question</Link>
          </div>
        </section>
      ) : null}
      {member && onboardingReady && recommendedCategory ? (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-950 shadow-sm sm:p-4">
          <p className="font-semibold">Recommended for you</p>
          {recommendedPosts.length ? (
            <div className="mt-2 space-y-1.5">
              {recommendedPosts.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="block truncate text-sm font-medium text-slate-950 hover:underline">
                  {post.title}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-1.5 leading-5">Start with <span className="font-semibold">{recommendedCategory}</span>.</p>
          )}
        </section>
      ) : null}
      <FeedFilters />
      <FeedPostList initialPosts={feed.items} initialPage={feed.page} hasMore={feed.hasMore} />
    </div>
  );
}
