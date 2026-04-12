import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { getCurrentMember } from '@/lib/auth';
import { getSavedPosts, getUserCommentedPosts, getUserComments, getUserLikedPosts } from '@/lib/data';

export default async function ActivityPage() {
  const member = await getCurrentMember();
  if (!member) redirect('/');

  const [savedPosts, likedPosts, commentedPosts, comments] = await Promise.all([
    getSavedPosts(),
    getUserLikedPosts(),
    getUserCommentedPosts(),
    getUserComments(),
  ]);

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader
        eyebrow="Activity"
        title="Your saved, liked, and commented posts"
        description="A personal control center for the threads and posts you actually touched."
      />

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
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
          <div key={comment.id} className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            <p className="leading-7">{comment.body}</p>
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
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
  return <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">{text}</div>;
}
