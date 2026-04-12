import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { getCurrentMember } from '@/lib/auth';
import { getSavedPosts } from '@/lib/data';

export default async function SavedPostsPage() {
  const member = await getCurrentMember();
  if (!member) redirect('/');

  const posts = await getSavedPosts();

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Saved"
        title="Your saved posts"
        description="Keep the useful stuff close: housing leads, job posts, local tips, and anything worth coming back to."
      />
      {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} />) : (
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
          You have not saved anything yet. Bookmark posts from the feed and they will show up here.
        </section>
      )}
    </div>
  );
}
