import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { getFeedPosts } from '@/lib/data';

export default async function FeedPage() {
  const posts = await getFeedPosts();

  return (
    <div className="space-y-4 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Feed"
        title="Latest community posts"
        description="Read the newest housing leads, job opportunities, and daily-life fixes from foreigners already navigating Korea."
      />
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
