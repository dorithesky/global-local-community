import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { FeedFilters } from '@/components/feed-filters';
import { getFeedPosts } from '@/lib/data';

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ city?: string; category?: string; q?: string; sort?: string }> }) {
  const params = await searchParams;
  const posts = await getFeedPosts({ city: params.city, category: params.category, query: params.q, sort: params.sort });

  return (
    <div className="space-y-4 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Feed"
        title="Latest community posts"
        description="Read the newest housing leads, job opportunities, and daily-life fixes from foreigners already navigating Korea."
      />
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
