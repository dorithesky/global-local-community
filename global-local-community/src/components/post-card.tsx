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
    <article className="overflow-hidden rounded-3xl border border-sky-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 lg:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
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
              <p className="text-xs leading-5 text-slate-500 sm:truncate">
                @{post.author.username} • {cityScopeLabel(post.city, post.district)} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </Link>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-800">{post.category}</span>
            {post.author.city ? <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">{post.author.city}</span> : null}
            {post.author.occupation ? <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">{post.author.occupation}</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {post.canEdit ? <FeedDeleteButton action={deletePostAction.bind(null, post.id)} /> : null}
        </div>
      </div>

      <Link href={`/posts/${post.id}`} className="block">
        <h2 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">{post.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 sm:leading-7">{post.body}</p>
        {post.imageUrls?.length ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> {post.imageUrls.length} image{post.imageUrls.length === 1 ? '' : 's'}</span>
          </div>
        ) : null}
        <PostImages imageUrls={post.imageUrls} title={post.title} compact />
      </Link>

      {post.tags.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1">#{tag}</span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <FeedLikeButton action={toggleLikeAction.bind(null, post.id)} active={Boolean(post.liked)} count={post.likesCount} />
          <FeedBookmarkButton action={toggleBookmarkAction.bind(null, post.id)} active={Boolean(post.bookmarked)} />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-2 text-xs text-slate-600"><MessageCircle className="h-4 w-4" /> {post.commentsCount} repl{post.commentsCount === 1 ? 'y' : 'ies'}</span>
        </div>
      </div>
    </article>
  );
}
