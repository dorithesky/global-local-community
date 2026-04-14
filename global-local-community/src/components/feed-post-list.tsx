"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { PostCard } from '@/components/post-card';
import { PostListItem } from '@/components/post-list-item';
import { getPostListViewMode } from '@/components/post-list-view-toggle';
import type { PostRecord } from '@/lib/types';

export function FeedPostList({ initialPosts, initialPage, hasMore: initialHasMore }: { initialPosts: PostRecord[]; initialPage: number; hasMore: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<PostRecord[]>(initialPosts);
  const view = getPostListViewMode(searchParams.get('view'));
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(page + 1));
      params.set('limit', '10');
      const response = await fetch(`/api/posts?${params.toString()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load more posts.');
      const payload = await response.json();
      setPosts((current) => {
        const incoming = Array.isArray(payload.data) ? payload.data : [];
        const seen = new Set(current.map((post) => post.id));
        const merged = [...current];
        for (const post of incoming) {
          if (!seen.has(post.id)) {
            seen.add(post.id);
            merged.push(post);
          }
        }
        return merged;
      });
      setPage(payload.pagination?.page ?? page + 1);
      setHasMore(Boolean(payload.pagination?.hasMore));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load more posts.');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, page, searchParams]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          void loadMore();
        }
      },
      {
        root: null,
        rootMargin: '400px 0px',
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (!posts.length) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm sm:p-8">
        No posts matched those filters yet. Try a broader city, category, or search phrase.
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {posts.map((post) => (
          view === 'list' ? <PostListItem key={post.id} post={post} /> : <PostCard key={post.id} post={post} />
        ))}
      </div>
      <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
      <div className="flex flex-col items-center gap-3 pt-1">
        {hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="min-h-11 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? 'Loading more...' : 'Load 10 more'}
          </button>
        ) : posts.length > 10 ? (
          <a href={`${pathname}#top`} className="text-sm font-medium text-sky-700 hover:text-sky-800">Back to top</a>
        ) : null}
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      </div>
    </div>
  );
}
