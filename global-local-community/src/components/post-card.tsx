import Link from 'next/link';
import { Bookmark, Heart, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { PostRecord } from '@/lib/types';

export function PostCard({ post }: { post: PostRecord }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900">{post.author.displayName}</p>
          <p className="text-xs text-slate-500">
            @{post.author.username} • {post.district ?? post.city} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">{post.category}</span>
      </div>
      <Link href={`/posts/${post.id}`} className="block">
        <h2 className="text-lg font-semibold text-slate-900">{post.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.body}</p>
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-2 py-1">#{tag}</span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1"><Heart className="h-4 w-4" /> {post.likesCount}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {post.commentsCount}</span>
        </div>
        <span className="inline-flex items-center gap-1"><Bookmark className="h-4 w-4" /> {post.bookmarked ? 'Saved' : 'Save'}</span>
      </div>
      <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
        <p className="font-medium text-slate-900">AI signal</p>
        <p>{post.analysis.label} • score {post.analysis.score.toFixed(2)} • {post.analysis.explanation}</p>
      </div>
    </article>
  );
}
