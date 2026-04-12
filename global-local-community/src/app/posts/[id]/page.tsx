import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { CommentForm } from '@/components/post-engagement-forms';
import { PostDetailReportTrigger } from '@/components/post-detail-report-trigger';
import { BookmarkButton, LikeButton } from '@/components/post-actions';
import { cityScopeLabel } from '@/lib/locations';
import { getPost, getPostComments } from '@/lib/data';
import { createCommentAction, createReportAction } from './actions';
import { toggleBookmarkAction, toggleLikeAction } from './engagement-actions';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  const comments = await getPostComments(id);

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader eyebrow={post.category} title={post.title} description={`Posted by ${post.author.displayName} in ${cityScopeLabel(post.city, post.district)}.`} />
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3 rounded-2xl transition hover:bg-slate-50/80">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatarUrl} alt={post.author.displayName} className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 ring-2 ring-slate-100">
                {post.author.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="font-medium text-slate-900">{post.author.displayName}</span>
            <span className="text-slate-400">@{post.author.username}</span>
          </Link>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          <span>•</span>
          <span>{cityScopeLabel(post.city, post.district)}</span>
        </div>
        <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{post.body}</div>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <LikeButton action={toggleLikeAction.bind(null, id)} active={Boolean(post.liked)} count={post.likesCount} />
          <BookmarkButton action={toggleBookmarkAction.bind(null, id)} active={Boolean(post.bookmarked)} />
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2"><MessageCircle className="h-4 w-4" /> {post.commentsCount} comments</span>
          <PostDetailReportTrigger action={createReportAction.bind(null, id)} />
        </div>
        <details className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-slate-900">
            <span>Post quality signals</span>
            <ChevronDown className="h-4 w-4" />
          </summary>
          <div className="mt-3 space-y-1">
            <p>Label: {post.analysis.label}</p>
            <p>Score: {post.analysis.score.toFixed(2)}</p>
            <p>Why: {post.analysis.explanation}</p>
          </div>
        </details>
      </article>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Comments</h2>
          <div className="mt-4 space-y-4">
            {comments.length ? comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  {comment.author.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={comment.author.avatarUrl} alt={comment.author.displayName} className="h-9 w-9 rounded-full object-cover ring-2 ring-white" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700 ring-2 ring-white">
                      {comment.author.displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <Link href={`/profile/${comment.author.username}`} className="block rounded-xl transition hover:bg-white/70">
                      <p className="text-sm font-medium text-slate-900">{comment.author.displayName}</p>
                      <p className="mt-1 text-xs text-slate-500">@{comment.author.username}</p>
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{comment.body}</p>
                  </div>
                </div>
              </div>
            )) : <p className="text-sm text-slate-500">No comments yet. Add the first useful reply.</p>}
          </div>
        </div>
        <div className="space-y-4">
          <CommentForm action={createCommentAction.bind(null, id)} />
        </div>
      </section>
    </div>
  );
}
