import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { CommentThread } from '@/components/comment-thread';
import { CommentForm } from '@/components/post-engagement-forms';
import { PostDetailReportTrigger } from '@/components/post-detail-report-trigger';
import { BookmarkButton, DeletePostButton, LikeButton } from '@/components/post-actions';
import { PostImages } from '@/components/post-images';
import { cityScopeLabel } from '@/lib/locations';
import { getCommentCountByPostId, getPostDetail } from '@/lib/data';
import { getCurrentMember } from '@/lib/auth';
import { SignInGuard } from '@/components/sign-in-guard';
import { createCommentAction, createReportAction, deleteCommentAction, updateCommentAction } from './actions';
import { deletePostAction, toggleBookmarkAction, toggleLikeAction } from './engagement-actions';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { post } = await getPostDetail(id);

  if (!post) {
    return {
      title: 'Post not found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = `${post.body.replace(/\s+/g, ' ').trim().slice(0, 140)}${post.body.length > 140 ? '…' : ''}`;
  const title = post.title;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ post, comments }, visibleCommentCount, currentMember] = await Promise.all([
    getPostDetail(id),
    getCommentCountByPostId(id),
    getCurrentMember(),
  ]);
  if (!post) notFound();

  return (
    <div className="space-y-5 pb-24 lg:space-y-6 lg:pb-8">
      <PageHeader eyebrow={post.category} title={post.title} description={`Posted by ${post.author.displayName} in ${cityScopeLabel(post.city, post.district)}.`} />
      <article className="relative rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-6">
        <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
          {post.canDelete ? <DeletePostButton action={deletePostAction.bind(null, id)} compact /> : <PostDetailReportTrigger action={createReportAction.bind(null, id)} signedIn={Boolean(currentMember)} />}
        </div>
        <div className="flex flex-wrap items-center gap-2 pr-12 text-sm text-[var(--text-tertiary)] sm:gap-3 sm:pr-14">
          <Link href={`/profile/${post.author.username}`} className="flex min-w-0 items-center gap-3 rounded-2xl transition hover:bg-[var(--surface-muted)]/80">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatarUrl} alt={post.author.displayName} className="h-11 w-11 rounded-full object-cover ring-2 ring-[var(--border-subtle)]" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent-primary)] ring-2 ring-[var(--border-subtle)]">
                {post.author.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="truncate font-medium text-[var(--text-primary)]">{post.author.displayName}</span>
            <span className="truncate text-[var(--text-tertiary)]">@{post.author.username}</span>
          </Link>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          <span>•</span>
          <span>{cityScopeLabel(post.city, post.district)}</span>
        </div>
        <div className="mt-4 whitespace-pre-line text-sm leading-6 text-[var(--text-secondary)] sm:leading-7">{post.body}</div>
        <PostImages imageUrls={post.imageUrls} title={post.title} />
        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-[var(--text-tertiary)] sm:gap-3">
          <LikeButton action={toggleLikeAction.bind(null, id)} active={Boolean(post.liked)} count={post.likesCount} />
          <BookmarkButton action={toggleBookmarkAction.bind(null, id)} active={Boolean(post.bookmarked)} />
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-2"><MessageCircle className="h-4 w-4" /> {visibleCommentCount} comments</span>
        </div>
      </article>

      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Discussion</h2>
          <span className="text-sm text-[var(--text-tertiary)]">{visibleCommentCount} {visibleCommentCount === 1 ? 'reply' : 'replies'}</span>
        </div>
        <div className="mt-5 border-t border-[var(--border-subtle)] pt-5">
          {currentMember ? (
            <CommentForm action={createCommentAction.bind(null, id)} />
          ) : (
            <SignInGuard
              title="Sign in to join the conversation"
              description="Reading stays open, but posting replies requires an account so profiles, moderation, and trust signals stay meaningful."
              ctaLabel="Sign in to comment"
              className="rounded-3xl border border-[var(--border-strong)] bg-[var(--accent-soft)] p-4 sm:p-5"
            />
          )}
        </div>
        <div className="mt-5 border-t border-[var(--border-subtle)] pt-5">
          {comments.length ? (
            <CommentThread
              comments={comments}
              updateAction={updateCommentAction.bind(null, id)}
              deleteAction={deleteCommentAction.bind(null, id)}
              reportAction={createReportAction.bind(null, id)}
              replyAction={createCommentAction.bind(null, id)}
              signedIn={Boolean(currentMember)}
            />
          ) : (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-4 text-sm text-[var(--text-secondary)]">
              No comments yet. Add the first useful reply.
            </div>
          )}
        </div>
        <details className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/70 p-4 text-sm leading-6 text-[var(--text-secondary)]">
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-[var(--text-primary)]">
            <span>Content classification</span>
            <ChevronDown className="h-4 w-4" />
          </summary>
          <div className="mt-3 space-y-1">
            <p>Status: {post.analysis.label}</p>
            <p>Confidence: {post.analysis.score.toFixed(2)}</p>
            <p>Reason: {post.analysis.explanation}</p>
          </div>
        </details>
      </section>
    </div>
  );
}
