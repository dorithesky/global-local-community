"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { KOREA_CITIES } from '@/lib/locations';

const categoryOptions = ['all', 'housing', 'jobs', 'daily-life', 'events', 'marketplace'] as const;

export function FeedFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all') params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <section className="rounded-3xl border border-sky-100 bg-gradient-to-r from-white to-sky-50/50 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            defaultValue={searchParams.get('q') ?? ''}
            onKeyDown={(event) => {
              if (event.key === 'Enter') updateParam('q', (event.target as HTMLInputElement).value);
            }}
            placeholder="Search housing, jobs, neighborhoods, or keywords"
            className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm outline-none ring-sky-200 focus:ring"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-4 lg:w-auto">
          <select
            defaultValue={searchParams.get('city') ?? 'all'}
            onChange={(event) => updateParam('city', event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring"
          >
            <option value="all">All cities</option>
            {KOREA_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
          <select
            defaultValue={searchParams.get('category') ?? 'all'}
            onChange={(event) => updateParam('category', event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring"
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category === 'all' ? 'All categories' : category}</option>
            ))}
          </select>
          <select
            defaultValue={searchParams.get('sort') ?? 'relevance'}
            onChange={(event) => updateParam('sort', event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring"
          >
            <option value="relevance">Sort: relevance</option>
            <option value="recent">Sort: newest first</option>
            <option value="oldest">Sort: oldest first</option>
          </select>
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm font-medium text-sky-700 hover:bg-sky-50"
          >
            Reset filters
          </button>
        </div>
      </div>
    </section>
  );
}
