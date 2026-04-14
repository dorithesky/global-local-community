import Link from 'next/link';
import { ImageIcon, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { FeedBookmarkButton, FeedDeleteButton, FeedLikeButton } from '@/components/post-card-actions';
import { RoleBadge } from '@/components/role-badge';
import { deletePostAction, toggleBookmarkAction, toggleLikeAction } from '@/app/posts/[id]/engagement-actions';
import { cityScopeLabel } from '@/lib/locations';
import type { PostRecord } from '@/lib/types';
import { PostImages } from '@/components/post-images';

export function PostCard({ post }: { post: PostRecord }) {
  return (
    <article className="relative overflow-hidden rounded-[1.6rem] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-3.5 lg:p-4">
      {post.canDelete ? (
        <div className="absolute right-3 top-3 z-10 sm:right-3.5 sm:top-3.5">
          <FeedDeleteButton action={deletePostAction.bind(null, post.id)} compact />
        </div>
      ) : null}
      <div className="mb-2 flex flex-col gap-2">
        <div className="min-w-0 flex-1 pr-16 sm:pr-20">
          <Link href={`/profile/${post.author.username}`} className="flex min-w-0 items-center gap-2.5 rounded-2xl transition hover:bg-[var(--surface-muted)]/80">
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
                <p className="truncate text-[13px] font-semibold text-[var(--text-primary)] sm:text-sm">{post.author.displayName}</p>
                {post.author.badges?.includes('admin') ? <RoleBadge role="admin" /> : null}
                {!post.author.badges?.includes('admin') && post.author.badges?.includes('moderator') ? <RoleBadge role="moderator" /> : null}
              </div>
              <p className="text-[11px] leading-4 text-[var(--text-tertiary)] sm:truncate">
                @{post.author.username} • {cityScopeLabel(post.city, post.district)} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </Link>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="rounded-full bg-[var(--accent-soft)]/70 px-2 py-0.5 text-[10px] font-semibold leading-none text-[var(--accent-primary)]">{post.category}</span>
            {post.author.city ? <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-medium leading-none text-[var(--text-secondary)]">{post.author.city}</span> : null}
            {post.author.occupation ? <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-medium leading-none text-[var(--text-secondary)]">{post.author.occupation}</span> : null}
          </div>
        </div>
      </div>

      <Link href={`/posts/${post.id}`} className="block">
        <h2 className="text-[1.02rem] font-semibold tracking-tight text-[var(--text-primary)] sm:text-[1.08rem]">{post.title}</h2>
        <p className="mt-1 line-clamp-3 text-[13px] leading-[1.35rem] text-[var(--text-secondary)] sm:text-sm sm:leading-5">{post.body}</p>
        {post.imageUrls?.length ? (
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
            <span className="inline-flex items-center gap-1"><ImageIcon className="h-3 w-3" /> {post.imageUrls.length} image{post.imageUrls.length === 1 ? '' : 's'}</span>
          </div>
        ) : null}
        <PostImages imageUrls={post.imageUrls} title={post.title} compact />
      </Link>

      {post.tags.length ? (
        <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-[var(--surface-muted)] px-1.5 py-0.5 leading-none">#{tag}</span>
          ))}
        </div>
      ) : null}

      <div className="mt-2.5 flex flex-col gap-1.5 border-t border-[var(--border-subtle)] pt-2 text-sm text-[var(--text-tertiary)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          <FeedLikeButton action={toggleLikeAction.bind(null, post.id)} active={Boolean(post.liked)} count={post.likesCount} />
          <FeedBookmarkButton action={toggleBookmarkAction.bind(null, post.id)} active={Boolean(post.bookmarked)} />
          <Link href={`/posts/${post.id}`} className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2 py-1 text-[10px] text-[var(--text-secondary)] transition hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"><MessageCircle className="h-3 w-3" /> {post.commentsCount} repl{post.commentsCount === 1 ? 'y' : 'ies'}</Link>
        </div>
      </div>
    </article>
  );
}
