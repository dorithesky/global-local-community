import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { FeedFilters } from '@/components/feed-filters';
import { getFeedPosts } from '@/lib/data';
import { getCurrentMember } from '@/lib/auth';
import { getAccountSettings } from '@/lib/settings';

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ city?: string; category?: string; q?: string; sort?: string }> }) {
  const params = await searchParams;
  const member = await getCurrentMember();
  const settings = member ? await getAccountSettings() : null;
  const posts = await getFeedPosts({ city: params.city, category: params.category, query: params.q, sort: params.sort });
  const onboardingReady = Boolean(
    settings?.profile.city || settings?.profile.occupation || settings?.profile.originCountry || settings?.profile.lifeStage || settings?.profile.immediateNeed,
  );
  const recommendedCategory = settings?.profile.immediateNeed || null;

  return (
    <div className="space-y-4 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Feed"
        title="Latest community posts"
        description="Read the newest housing leads, job opportunities, and daily-life fixes from foreigners already navigating Korea."
      />
      {member && !onboardingReady ? (
        <section className="rounded-[28px] border border-sky-200 bg-sky-50 p-5 text-sm text-sky-950 shadow-sm">
          <p className="font-semibold">Complete your profile to improve this feed</p>
          <p className="mt-2 leading-6">Add your city, occupation, origin, and current need so the product can route you into more relevant conversations from the first session.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/settings?onboarding=1" className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Finish onboarding</Link>
            <Link href="/create" className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-white">Ask your first question</Link>
          </div>
        </section>
      ) : null}
      {member && onboardingReady && recommendedCategory ? (
        <section className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-950 shadow-sm">
          <p className="font-semibold">Feed tuned to your current need</p>
          <p className="mt-2 leading-6">You said your biggest need right now is <span className="font-semibold">{recommendedCategory}</span>. Start with posts in that area, then widen out when you need broader context.</p>
        </section>
      ) : null}
      <FeedFilters />
      {posts.length ? posts.map((post) => (
        <PostCard key={post.id} post={post} />
      )) : (
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
          No posts matched those filters yet. Try a broader city, category, or search phrase.
        </section>
      )}
    </div>
  );
}
