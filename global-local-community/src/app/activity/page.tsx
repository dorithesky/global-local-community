import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { ServerPaginatedPostList } from '@/components/server-paginated-post-list';
import { getCurrentMember } from '@/lib/auth';
import { markSensitiveRoute } from '@/lib/cache-policy';
import { getSavedPosts, getUserCommentedPosts, getUserComments, getUserLikedPosts } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Your activity',
  description: 'Private account activity inside Living In Korea.',
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

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ savedPage?: string; likedPage?: string; commentedPage?: string }> }) {
  markSensitiveRoute();
  const member = await getCurrentMember();
  if (!member) redirect('/');

  const params = await searchParams;
  const savedPage = Math.max(Number.parseInt(params.savedPage ?? '1', 10) || 1, 1);
  const likedPage = Math.max(Number.parseInt(params.likedPage ?? '1', 10) || 1, 1);
  const commentedPage = Math.max(Number.parseInt(params.commentedPage ?? '1', 10) || 1, 1);

  const [savedPosts, likedPosts, commentedPosts, comments] = await Promise.all([
    getSavedPosts({ page: savedPage, limit: 10 }),
    getUserLikedPosts({ page: likedPage, limit: 10 }),
    getUserCommentedPosts({ page: commentedPage, limit: 10 }),
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
            <p className="mt-1 text-2xl font-semibold text-slate-950">{savedPosts.total}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Liked</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{likedPosts.total}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Commented</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{comments.length}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Saved posts</h2>
        <ServerPaginatedPostList posts={savedPosts.items} page={savedPosts.page} hasMore={savedPosts.hasMore} emptyMessage="Nothing saved yet." pageParam="savedPage" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Liked posts</h2>
        <ServerPaginatedPostList posts={likedPosts.items} page={likedPosts.page} hasMore={likedPosts.hasMore} emptyMessage="No liked posts yet." pageParam="likedPage" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Commented posts</h2>
        <ServerPaginatedPostList posts={commentedPosts.items} page={commentedPosts.page} hasMore={commentedPosts.hasMore} emptyMessage="No commented posts yet." pageParam="commentedPage" />
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
