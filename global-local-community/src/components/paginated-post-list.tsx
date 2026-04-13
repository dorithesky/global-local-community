"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PostCard } from '@/components/post-card';
import type { PostRecord } from '@/lib/types';

export function PaginatedPostList({ posts, pageSize = 10, emptyMessage }: { posts: PostRecord[]; pageSize?: number; emptyMessage: string }) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const visiblePosts = useMemo(() => posts.slice(0, visibleCount), [posts, visibleCount]);
  const hasMore = visibleCount < posts.length;

  if (!posts.length) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm sm:p-8">
        {emptyMessage}
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {visiblePosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasMore ? (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setVisibleCount((current) => current + pageSize)}
            className="min-h-11 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Load 10 more
          </button>
        </div>
      ) : posts.length > pageSize ? (
        <div className="flex justify-center pt-1">
          <Link href="#top" className="text-sm font-medium text-sky-700 hover:text-sky-800">Back to top</Link>
        </div>
      ) : null}
    </div>
  );
}
