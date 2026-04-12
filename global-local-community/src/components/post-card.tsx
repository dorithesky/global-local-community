import Link from 'next/link';
import { ImageIcon, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { FeedBookmarkButton, FeedDeleteButton, FeedLikeButton, FeedReportButton } from '@/components/post-card-actions';
import { createReportAction } from '@/app/posts/[id]/actions';
import { deletePostAction, toggleBookmarkAction, toggleLikeAction } from '@/app/posts/[id]/engagement-actions';
import { cityScopeLabel } from '@/lib/locations';
import type { PostRecord } from '@/lib/types';

export function PostCard({ post }: { post: PostRecord }) {
  return (
    <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
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
            <p className="text-sm font-semibold text-slate-900">{post.author.displayName}</p>
            <p className="truncate text-xs text-slate-500">
              @{post.author.username} • {cityScopeLabel(post.city, post.district)} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{post.category}</span>
          {post.canEdit ? <FeedDeleteButton action={deletePostAction.bind(null, post.id)} /> : <FeedReportButton action={createReportAction.bind(null, post.id)} />}
        </div>
      </div>
      <Link href={`/posts/${post.id}`} className="block">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">{post.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{post.body}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Images coming to this post flow</span>
        </div>
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {post.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1">#{tag}</span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
        <div className="flex items-center gap-3">
          <FeedLikeButton action={toggleLikeAction.bind(null, post.id)} active={Boolean(post.liked)} count={post.likesCount} />
          <FeedBookmarkButton action={toggleBookmarkAction.bind(null, post.id)} active={Boolean(post.bookmarked)} />
          <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {post.commentsCount}</span>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs leading-6 text-slate-600">
        <p className="font-semibold text-slate-900">Quick context</p>
        <p>{cityScopeLabel(post.city, post.district)} • {post.category} • {post.commentsCount} replies</p>
      </div>
    </article>
  );
}
