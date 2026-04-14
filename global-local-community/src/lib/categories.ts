import type { Category } from '@/lib/types';

export type TopLevelCategoryGroup = 'housing' | 'jobs' | 'life-in-korea' | 'community';

export const CATEGORY_META: Record<Category, { label: string; shortLabel: string; group: TopLevelCategoryGroup; description: string; tone: string }> = {
  housing: {
    label: 'Housing',
    shortLabel: 'Housing',
    group: 'housing',
    description: 'Apartments, officetels, contracts, deposits, and moving questions.',
    tone: 'bg-sky-100 text-slate-950 dark:bg-sky-500/15 dark:text-sky-200',
  },
  jobs: {
    label: 'Jobs',
    shortLabel: 'Jobs',
    group: 'jobs',
    description: 'Hiring posts, recruiters, contracts, and visa-compatible work.',
    tone: 'bg-indigo-100 text-slate-950 dark:bg-indigo-500/15 dark:text-indigo-200',
  },
  visa: {
    label: 'Visa & ARC',
    shortLabel: 'Visa',
    group: 'life-in-korea',
    description: 'Visa changes, ARC issues, immigration timing, and sponsorship questions.',
    tone: 'bg-violet-100 text-slate-950 dark:bg-violet-500/15 dark:text-violet-200',
  },
  healthcare: {
    label: 'Healthcare',
    shortLabel: 'Healthcare',
    group: 'life-in-korea',
    description: 'Hospitals, clinics, insurance, dental, mental health, and prescriptions.',
    tone: 'bg-rose-100 text-slate-950 dark:bg-rose-500/15 dark:text-rose-200',
  },
  banking: {
    label: 'Banking',
    shortLabel: 'Banking',
    group: 'life-in-korea',
    description: 'Banks, cards, transfers, apps, verification, and payment issues.',
    tone: 'bg-emerald-100 text-slate-950 dark:bg-emerald-500/15 dark:text-emerald-200',
  },
  'phone-internet': {
    label: 'Phone & Internet',
    shortLabel: 'Phone',
    group: 'life-in-korea',
    description: 'SIM cards, plans, home internet, device setup, and carrier issues.',
    tone: 'bg-cyan-100 text-slate-950 dark:bg-cyan-500/15 dark:text-cyan-200',
  },
  transport: {
    label: 'Transport',
    shortLabel: 'Transport',
    group: 'life-in-korea',
    description: 'Subway, buses, KTX, taxis, driving, and commuting questions.',
    tone: 'bg-amber-100 text-slate-950 dark:bg-amber-500/15 dark:text-amber-200',
  },
  documents: {
    label: 'Documents',
    shortLabel: 'Documents',
    group: 'life-in-korea',
    description: 'Government paperwork, 주민센터, registrations, and admin steps.',
    tone: 'bg-stone-200 text-slate-950 dark:bg-stone-500/20 dark:text-stone-200',
  },
  'daily-life': {
    label: 'Daily Life',
    shortLabel: 'Daily life',
    group: 'life-in-korea',
    description: 'Everyday friction, local routines, etiquette, apps, and settling-in questions.',
    tone: 'bg-fuchsia-100 text-slate-950 dark:bg-fuchsia-500/15 dark:text-fuchsia-200',
  },
  events: {
    label: 'Events',
    shortLabel: 'Events',
    group: 'community',
    description: 'Meetups, language exchange, classes, and social plans.',
    tone: 'bg-amber-100 text-slate-950 dark:bg-amber-500/15 dark:text-amber-200',
  },
  meetups: {
    label: 'Meetups',
    shortLabel: 'Meetups',
    group: 'community',
    description: 'Small group plans, hobby gatherings, networking, and local hangouts.',
    tone: 'bg-orange-100 text-slate-950 dark:bg-orange-500/15 dark:text-orange-200',
  },
  'local-tips': {
    label: 'Local Tips',
    shortLabel: 'Local tips',
    group: 'community',
    description: 'Neighborhood advice, practical recommendations, and city-specific tips.',
    tone: 'bg-lime-100 text-slate-950 dark:bg-lime-500/15 dark:text-lime-200',
  },
  marketplace: {
    label: 'Marketplace',
    shortLabel: 'Marketplace',
    group: 'community',
    description: 'Buy/sell useful items for life in Korea.',
    tone: 'bg-emerald-100 text-slate-950 dark:bg-emerald-500/15 dark:text-emerald-200',
  },
};

export const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All categories' },
  { value: 'housing', label: 'Housing' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'visa', label: 'Visa & ARC' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'banking', label: 'Banking' },
  { value: 'phone-internet', label: 'Phone & Internet' },
  { value: 'transport', label: 'Transport' },
  { value: 'documents', label: 'Documents' },
  { value: 'daily-life', label: 'Daily Life' },
  { value: 'events', label: 'Events' },
  { value: 'meetups', label: 'Meetups' },
  { value: 'local-tips', label: 'Local Tips' },
  { value: 'marketplace', label: 'Marketplace' },
] as const;

export const TOP_LEVEL_NAV_GROUPS: Array<{ slug: TopLevelCategoryGroup; label: string; description: string; categories: Category[] }> = [
  {
    slug: 'housing',
    label: 'Housing',
    description: 'Rentals, deposits, moving, and housing search.',
    categories: ['housing'],
  },
  {
    slug: 'jobs',
    label: 'Jobs',
    description: 'Work, recruiters, applications, and contracts.',
    categories: ['jobs'],
  },
  {
    slug: 'life-in-korea',
    label: 'Life in Korea',
    description: 'Visa, healthcare, banking, transport, paperwork, and daily life.',
    categories: ['visa', 'healthcare', 'banking', 'phone-internet', 'transport', 'documents', 'daily-life'],
  },
  {
    slug: 'community',
    label: 'Community',
    description: 'Events, meetups, local tips, and marketplace activity.',
    categories: ['events', 'meetups', 'local-tips', 'marketplace'],
  },
];

export function isCategory(value: string): value is Category {
  return value in CATEGORY_META;
}

export function getCategoryMeta(category: Category) {
  return CATEGORY_META[category];
}

export function getGroupCategories(group: TopLevelCategoryGroup) {
  return TOP_LEVEL_NAV_GROUPS.find((item) => item.slug === group)?.categories ?? [];
}
