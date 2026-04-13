import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { getCurrentMember } from '@/lib/auth';
import { markSensitiveRoute } from '@/lib/cache-policy';
import { getSavedPosts, getUserCommentedPosts, getUserComments, getUserLikedPosts } from '@/lib/data';

export default async function ActivityPage() {
  markSensitiveRoute();
  const member = await getCurrentMember();
  if (!member) redirect('/');

  const [savedPosts, likedPosts, commentedPosts, comments] = await Promise.all([
    getSavedPosts(),
    getUserLikedPosts(),
    getUserCommentedPosts(),
    getUserComments(),
  ]);

  return (
    <div className="space-y-5 pb-24 lg:space-y-6 lg:pb-8">
      <PageHeader
        eyebrow="Activity"
        title="Your saved, liked, and commented posts"
        description="A personal control center for the threads and posts you actually touched."
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-slate-900">Saved</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{savedPosts.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Liked</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{likedPosts.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Commented</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{comments.length}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Saved posts</h2>
        {savedPosts.length ? savedPosts.map((post) => <PostCard key={`saved-${post.id}`} post={post} />) : <EmptyState text="Nothing saved yet." />}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Liked posts</h2>
        {likedPosts.length ? likedPosts.map((post) => <PostCard key={`liked-${post.id}`} post={post} />) : <EmptyState text="No liked posts yet." />}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Commented posts</h2>
        {commentedPosts.length ? commentedPosts.map((post) => <PostCard key={`commented-${post.id}`} post={post} />) : <EmptyState text="No commented posts yet." />}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Your comments</h2>
        {comments.length ? comments.map((comment) => (
          <div key={comment.id} className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm sm:p-6">
            <p className="leading-6 sm:leading-7">{comment.body}</p>
            <div className="mt-3 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>{new Date(comment.createdAt).toLocaleString()}</span>
              <a href={`/posts/${comment.postId}`} className="font-medium text-sky-700 hover:text-sky-800">Open post</a>
            </div>
          </div>
        )) : <EmptyState text="No comments yet." />}
      </section>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm sm:p-6">{text}</div>;
}
