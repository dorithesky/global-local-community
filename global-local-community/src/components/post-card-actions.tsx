"use client";

import { Flag, Bookmark, Heart } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function ActionButton({ label, icon, tone = 'neutral' }: { label: string; icon: React.ReactNode; tone?: 'neutral' | 'danger' }) {
  const { pending } = useFormStatus();
  const toneClass = tone === 'danger'
    ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';

  return (
    <button type="submit" disabled={pending} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium disabled:opacity-60 ${toneClass}`}>
      {icon}
      {pending ? 'Saving...' : label}
    </button>
  );
}

export function FeedLikeButton({ action, active, count }: { action: (formData: FormData) => Promise<void>; active: boolean; count: number }) {
  return (
    <form action={action}>
      <ActionButton label={`${active ? 'Liked' : 'Like'} • ${count}`} icon={<Heart className="h-3.5 w-3.5" />} />
    </form>
  );
}

export function FeedBookmarkButton({ action, active }: { action: (formData: FormData) => Promise<void>; active: boolean }) {
  return (
    <form action={action}>
      <ActionButton label={active ? 'Saved' : 'Save'} icon={<Bookmark className="h-3.5 w-3.5" />} />
    </form>
  );
}

export function FeedReportButton({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action}>
      <input type="hidden" name="reason" value="other" />
      <input type="hidden" name="details" value="Quick report from feed card." />
      <ActionButton label="Report" icon={<Flag className="h-3.5 w-3.5" />} tone="danger" />
    </form>
  );
}
