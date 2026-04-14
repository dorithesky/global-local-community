import Link from 'next/link';
import { ImageIcon, MessageCircle, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { FeedBookmarkButton, FeedDeleteButton, FeedLikeButton } from '@/components/post-card-actions';
import { RoleBadge } from '@/components/role-badge';
import { deletePostAction, toggleBookmarkAction, toggleLikeAction } from '@/app/posts/[id]/engagement-actions';
import { cityScopeLabel } from '@/lib/locations';
import type { PostRecord } from '@/lib/types';
import { PostImages } from '@/components/post-images';

export function PostCard({ post }: { post: PostRecord }) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-4 lg:p-4.5">
      {post.canDelete ? (
        <div className="absolute right-3.5 top-3.5 z-10 sm:right-4 sm:top-4">
          <FeedDeleteButton action={deletePostAction.bind(null, post.id)} compact />
        </div>
      ) : null}
      <div className="mb-2.5 flex flex-col gap-2.5">
        {typeof post.rank === 'number' ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--text-tertiary)]">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold leading-none shadow-sm ${post.rank === 1 ? 'border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-200' : post.rank === 2 ? 'border-indigo-300 bg-indigo-100 text-indigo-950 dark:border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-200' : post.rank === 3 ? 'border-teal-300 bg-teal-100 text-teal-950 dark:border-teal-500/20 dark:bg-teal-500/15 dark:text-teal-200' : 'border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-primary)]'}`}>
                <TrendingUp className="h-3 w-3" />
                Trending now
              </span>
              <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-[10px] font-bold shadow-sm ${post.rank === 1 ? 'border-amber-300 bg-amber-500 text-white dark:border-amber-300 dark:bg-amber-400 dark:text-slate-950' : post.rank === 2 ? 'border-indigo-300 bg-indigo-600 text-white dark:border-indigo-300 dark:bg-indigo-400 dark:text-slate-950' : post.rank === 3 ? 'border-teal-300 bg-teal-600 text-white dark:border-teal-300 dark:bg-teal-400 dark:text-slate-950' : 'border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-primary)]'}`}>#{post.rank}</span>
            </div>
            <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-semibold leading-none text-[var(--accent-primary)]">{post.category}</span>
          </div>
        ) : null}
        <div className="min-w-0 flex-1 pr-16 sm:pr-20">
          <Link href={`/profile/${post.author.username}`} className="flex min-w-0 items-center gap-3 rounded-2xl transition hover:bg-[var(--surface-muted)]/80">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatarUrl} alt={post.author.displayName} className="h-8 w-8 rounded-full object-cover ring-2 ring-[var(--border-subtle)]" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[12px] font-semibold text-[var(--accent-primary)] ring-2 ring-[var(--border-subtle)]">
                {post.author.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{post.author.displayName}</p>
                {post.author.badges?.includes('admin') ? <RoleBadge role="admin" /> : null}
                {!post.author.badges?.includes('admin') && post.author.badges?.includes('moderator') ? <RoleBadge role="moderator" /> : null}
              </div>
              <p className="text-xs leading-4.5 text-[var(--text-tertiary)] sm:truncate">
                @{post.author.username} • {cityScopeLabel(post.city, post.district)} • {post.category} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
            </Link>
          {post.author.occupation ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-medium leading-none text-[var(--text-secondary)]">{post.author.occupation}</span>
            </div>
          ) : null}
        </div>
      </div>

      <Link href={`/posts/${post.id}`} className="block">
        <h2 className="text-[1.05rem] font-semibold tracking-tight text-[var(--text-primary)] sm:text-[1.1rem]">{post.title}</h2>
        <p className="mt-1.5 line-clamp-3 text-sm leading-5 text-[var(--text-secondary)]">{post.body}</p>
        {post.imageUrls?.length ? (
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
            <span className="inline-flex items-center gap-1"><ImageIcon className="h-3 w-3" /> {post.imageUrls.length} image{post.imageUrls.length === 1 ? '' : 's'}</span>
          </div>
        ) : null}
        <PostImages imageUrls={post.imageUrls} title={post.title} compact />
      </Link>

      {post.tags.length ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 leading-none">#{tag}</span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-2.5 text-sm text-[var(--text-tertiary)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <FeedLikeButton action={toggleLikeAction.bind(null, post.id)} active={Boolean(post.liked)} count={post.likesCount} />
          <FeedBookmarkButton action={toggleBookmarkAction.bind(null, post.id)} active={Boolean(post.bookmarked)} />
          <Link href={`/posts/${post.id}`} className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-1.5 text-[11px] text-[var(--text-secondary)] transition hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"><MessageCircle className="h-3.5 w-3.5" /> {post.commentsCount} repl{post.commentsCount === 1 ? 'y' : 'ies'}</Link>
        </div>
      </div>
    </article>
  );
}
