"use client";

import { Trash2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function ActionButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50 disabled:opacity-60"
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

export function DeletePostButton({ action, compact = false }: { action: (formData: FormData) => Promise<void>; compact?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        className={compact
          ? 'inline-flex h-8 items-center gap-1 rounded-full border border-rose-200 bg-white px-2.5 text-[11px] font-medium text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:opacity-60'
          : 'inline-flex min-h-10 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60'}
      >
        <Trash2 className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        {pending ? 'Deleting...' : compact ? 'Delete' : 'Delete post'}
      </button>
    </form>
  );
}
