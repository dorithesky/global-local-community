"use client";

import { Trash2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function ActionButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-interactive)] px-3 py-2 text-sm font-medium text-[var(--accent-primary)] hover:bg-[var(--surface-muted)] disabled:opacity-60"
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
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm('Delete this post?')) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className={compact
          ? 'inline-flex h-8 items-center gap-1 rounded-full border border-[var(--danger-border)] bg-[var(--surface-interactive)] px-2.5 text-[11px] font-medium text-[var(--danger-text)] shadow-sm transition hover:bg-[var(--danger-soft)] disabled:opacity-60'
          : 'inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--danger-border)] bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger-text)] hover:brightness-110 disabled:opacity-60'}
      >
        <Trash2 className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        {pending ? 'Deleting...' : compact ? 'Delete' : 'Delete post'}
      </button>
    </form>
  );
}
