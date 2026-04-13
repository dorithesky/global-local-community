"use client";

import { useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { KOREA_CITIES } from '@/lib/locations';

const categoryOptions = [
  { value: 'all', label: 'All categories' },
  { value: 'housing', label: 'Housing' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'daily-life', label: 'Daily life' },
  { value: 'events', label: 'Events' },
  { value: 'marketplace', label: 'Marketplace' },
] as const;

export function FeedFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [expanded, setExpanded] = useState(false);

  const activeCount = useMemo(() => {
    let count = 0;
    if (searchParams.get('q')) count += 1;
    if (searchParams.get('city')) count += 1;
    if (searchParams.get('category')) count += 1;
    if (searchParams.get('sort') && searchParams.get('sort') !== 'recent') count += 1;
    return count;
  }, [searchParams]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all') params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  function submitQuery() {
    updateParam('q', query.trim());
  }

  return (
    <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3 shadow-sm sm:p-3.5">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitQuery();
              }}
              placeholder="Search posts"
              className="min-h-10.5 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-11 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none ring-sky-200 focus:ring"
            />
          </div>
          <button
            type="button"
            onClick={submitQuery}
            className="min-h-10.5 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500"
          >
            Search
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex min-h-9.5 items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 ? <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">{activeCount}</span> : null}
            <ChevronDown className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {activeCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                router.push(pathname);
              }}
              className="text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary-strong)]"
            >
              Reset
            </button>
          ) : null}
        </div>

        {expanded ? (
          <div className="grid gap-2.5 border-t border-[var(--border-subtle)] pt-2.5 sm:grid-cols-2 lg:grid-cols-3">
            <select
              defaultValue={searchParams.get('city') ?? 'all'}
              onChange={(event) => updateParam('city', event.target.value)}
              className="min-h-10.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none ring-sky-200 focus:ring"
            >
              <option value="all">All cities</option>
              {KOREA_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
            <select
              defaultValue={searchParams.get('category') ?? 'all'}
              onChange={(event) => updateParam('category', event.target.value)}
              className="min-h-10.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none ring-sky-200 focus:ring"
            >
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
            <select
              defaultValue={searchParams.get('sort') ?? 'recent'}
              onChange={(event) => updateParam('sort', event.target.value)}
              className="min-h-10.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none ring-sky-200 focus:ring"
            >
              <option value="recent">Newest first</option>
              <option value="relevance">Most relevant</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        ) : null}
      </div>
    </section>
  );
}
