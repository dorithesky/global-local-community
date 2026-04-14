"use client";

import { LayoutGrid, Rows3 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type PostListViewMode = 'card' | 'list';

export function getPostListViewMode(value: string | null | undefined): PostListViewMode {
  return value === 'list' ? 'list' : 'card';
}

export function PostListViewToggle({ view }: { view: PostListViewMode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setView(nextView: PostListViewMode) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextView === 'card') {
      params.delete('view');
    } else {
      params.set('view', nextView);
    }
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-1 shadow-sm">
      <button
        type="button"
        onClick={() => setView('card')}
        className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${view === 'card' ? 'bg-[var(--surface-interactive)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Cards
      </button>
      <button
        type="button"
        onClick={() => setView('list')}
        className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${view === 'list' ? 'bg-[var(--surface-interactive)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
      >
        <Rows3 className="h-3.5 w-3.5" />
        List
      </button>
    </div>
  );
}
