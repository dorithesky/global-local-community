import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { ServerPaginatedPostList } from '@/components/server-paginated-post-list';
import { getCurrentMember } from '@/lib/auth';
import { markSensitiveRoute } from '@/lib/cache-policy';
import { getSavedPosts } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Saved posts',
  description: 'Private saved posts inside Living In Korea.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      nosnippet: true,
    },
  },
};

export default async function SavedPostsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  markSensitiveRoute();
  const member = await getCurrentMember();
  if (!member) redirect('/');

  const page = Math.max(Number.parseInt((await searchParams).page ?? '1', 10) || 1, 1);
  const posts = await getSavedPosts({ page, limit: 10 });

  return (
    <div className="space-y-5 pb-24 lg:space-y-6 lg:pb-8">
      <PageHeader
        eyebrow="Saved"
        title="Your saved posts"
        description="Keep the useful stuff close: housing leads, job posts, local tips, and anything worth coming back to."
      />
      <ServerPaginatedPostList
        posts={posts.items}
        page={posts.page}
        hasMore={posts.hasMore}
        emptyMessage="You have not saved anything yet. Bookmark posts from the feed and they will show up here."
      />
    </div>
  );
}
