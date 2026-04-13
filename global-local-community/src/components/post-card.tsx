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
    <article className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-4 lg:p-4.5">
      {post.canDelete ? (
        <div className="absolute right-3.5 top-3.5 z-10 sm:right-4 sm:top-4">
          <FeedDeleteButton action={deletePostAction.bind(null, post.id)} compact />
        </div>
      ) : null}
      <div className="mb-2.5 flex flex-col gap-2.5">
        <div className="min-w-0 flex-1 pr-16 sm:pr-20">
          <Link href={`/profile/${post.author.username}`} className="flex min-w-0 items-center gap-3 rounded-2xl transition hover:bg-slate-50/80">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatarUrl} alt={post.author.displayName} className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700 ring-2 ring-slate-100">
                {post.author.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-slate-900">{post.author.displayName}</p>
                {post.author.badges?.includes('admin') ? <RoleBadge role="admin" /> : null}
                {!post.author.badges?.includes('admin') && post.author.badges?.includes('moderator') ? <RoleBadge role="moderator" /> : null}
              </div>
              <p className="text-xs leading-4.5 text-slate-500 sm:truncate">
                @{post.author.username} • {cityScopeLabel(post.city, post.district)} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </Link>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold leading-none text-sky-800">{post.category}</span>
            {post.author.city ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium leading-none text-slate-600">{post.author.city}</span> : null}
            {post.author.occupation ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium leading-none text-slate-600">{post.author.occupation}</span> : null}
          </div>
        </div>
      </div>

      <Link href={`/posts/${post.id}`} className="block">
        <h2 className="text-[1.05rem] font-semibold tracking-tight text-slate-950 sm:text-[1.1rem]">{post.title}</h2>
        <p className="mt-1.5 line-clamp-3 text-sm leading-5 text-slate-600">{post.body}</p>
        {post.imageUrls?.length ? (
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1"><ImageIcon className="h-3 w-3" /> {post.imageUrls.length} image{post.imageUrls.length === 1 ? '' : 's'}</span>
          </div>
        ) : null}
        <PostImages imageUrls={post.imageUrls} title={post.title} compact />
      </Link>

      {post.tags.length ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
          {post.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 leading-none">#{tag}</span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-2.5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <FeedLikeButton action={toggleLikeAction.bind(null, post.id)} active={Boolean(post.liked)} count={post.likesCount} />
          <FeedBookmarkButton action={toggleBookmarkAction.bind(null, post.id)} active={Boolean(post.bookmarked)} />
          <Link href={`/posts/${post.id}`} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"><MessageCircle className="h-3.5 w-3.5" /> {post.commentsCount} repl{post.commentsCount === 1 ? 'y' : 'ies'}</Link>
        </div>
      </div>
    </article>
  );
}
