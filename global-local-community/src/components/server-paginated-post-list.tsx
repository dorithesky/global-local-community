"use client";

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PostCard } from '@/components/post-card';
import { PostListItem } from '@/components/post-list-item';
import { getPostListViewMode, PostListViewToggle } from '@/components/post-list-view-toggle';
import type { PostRecord } from '@/lib/types';

export function ServerPaginatedPostList({ posts, page, hasMore, emptyMessage, pageParam = 'page', itemLabel = 'posts' }: { posts: PostRecord[]; page: number; hasMore: boolean; emptyMessage: string; pageParam?: string; itemLabel?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendingPage, setPendingPage] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const view = getPostListViewMode(searchParams.get('view'));

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete(pageParam);
    } else {
      params.set(pageParam, String(nextPage));
    }

    setPendingPage(nextPage);
    startTransition(() => {
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    });
  };

  if (!posts.length) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm sm:p-8">
        {emptyMessage}
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PostListViewToggle view={view} />
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          view === 'list' ? <PostListItem key={post.id} post={post} /> : <PostCard key={post.id} post={post} />
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Showing page {page} of {itemLabel}</p>
          <div className="flex items-center justify-center gap-3">
        {page > 1 ? (
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={isPending}
            className="min-h-11 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {isPending && pendingPage === page - 1 ? 'Loading...' : 'Previous 10'}
          </button>
        ) : null}
        {hasMore ? (
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={isPending}
            className="min-h-11 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {isPending && pendingPage === page + 1 ? 'Loading...' : 'Next 10'}
          </button>
        ) : posts.length > 0 ? (
          <Link href="#top" className="text-sm font-medium text-sky-700 hover:text-sky-800">Back to top</Link>
        ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
