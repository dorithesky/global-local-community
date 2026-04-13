import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { getCurrentMember } from '@/lib/auth';
import { markSensitiveRoute } from '@/lib/cache-policy';
import { getSavedPosts } from '@/lib/data';

export default async function SavedPostsPage() {
  markSensitiveRoute();
  const member = await getCurrentMember();
  if (!member) redirect('/');

  const posts = await getSavedPosts();

  return (
    <div className="space-y-5 pb-24 lg:space-y-6 lg:pb-8">
      <PageHeader
        eyebrow="Saved"
        title="Your saved posts"
        description="Keep the useful stuff close: housing leads, job posts, local tips, and anything worth coming back to."
      />
      {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} />) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm sm:p-8">
          You have not saved anything yet. Bookmark posts from the feed and they will show up here.
        </section>
      )}
    </div>
  );
}
