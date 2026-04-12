"use client";

import { useFormStatus } from 'react-dom';

function ActionButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function LikeButton({ action, active, count }: { action: (formData: FormData) => Promise<void>; active: boolean; count: number }) {
  return (
    <form action={action}>
      <ActionButton label={`${active ? 'Unlike' : 'Like'} • ${count}`} pendingLabel="Saving..." />
    </form>
  );
}

export function BookmarkButton({ action, active }: { action: (formData: FormData) => Promise<void>; active: boolean }) {
  return (
    <form action={action}>
      <ActionButton label={active ? 'Bookmarked' : 'Bookmark'} pendingLabel="Saving..." />
    </form>
  );
}
