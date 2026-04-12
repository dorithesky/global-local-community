import Link from 'next/link';
import { Bookmark, Heart, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cityScopeLabel } from '@/lib/locations';
import type { PostRecord } from '@/lib/types';

export function PostCard({ post }: { post: PostRecord }) {
  return (
    <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{post.author.displayName}</p>
          <p className="truncate text-xs text-slate-500">
            @{post.author.username} • {cityScopeLabel(post.city, post.district)} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{post.category}</span>
      </div>
      <Link href={`/posts/${post.id}`} className="block">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">{post.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{post.body}</p>
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {post.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1">#{tag}</span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5"><Heart className="h-4 w-4" /> {post.likesCount}</span>
          <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {post.commentsCount}</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"><Bookmark className="h-4 w-4" /> {post.bookmarked ? 'Saved' : 'Save'}</span>
      </div>
      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs leading-6 text-slate-600">
        <p className="font-semibold text-slate-900">AI signal</p>
        <p>{post.analysis.label} • score {post.analysis.score.toFixed(2)} • {post.analysis.explanation}</p>
      </div>
    </article>
  );
}
