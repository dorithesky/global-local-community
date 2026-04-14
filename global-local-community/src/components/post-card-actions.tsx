"use client";

import { Bookmark, Heart, Trash2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function ActionButton({ label, icon, tone = 'neutral', type = 'submit', onClick }: { label: string; icon: React.ReactNode; tone?: 'neutral' | 'danger'; type?: 'button' | 'submit'; onClick?: () => void }) {
  const { pending } = useFormStatus();
  const toneClass = tone === 'danger'
    ? 'border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger-text)] hover:brightness-110'
    : 'border-[var(--border-strong)] bg-[var(--surface-interactive)] text-[var(--accent-primary)] hover:bg-[var(--surface-muted)]';

  return (
    <button type={type} onClick={onClick} disabled={pending} className={`inline-flex min-h-9 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] font-medium disabled:opacity-60 ${toneClass}`}>
      {icon}
      {pending ? 'Saving...' : label}
    </button>
  );
}

export function FeedLikeButton({ action, active, count }: { action: (formData: FormData) => Promise<void>; active: boolean; count: number }) {
  return (
    <form action={action}>
      <ActionButton label={`${active ? 'Liked' : 'Like'} · ${count}`} icon={<Heart className="h-3.5 w-3.5" />} />
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

export function FeedDeleteButton({ action, compact = false }: { action: (formData: FormData) => Promise<void>; compact?: boolean }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm('Delete this post?')) {
          event.preventDefault();
        }
      }}
    >
      {compact ? (
        <button type="submit" className="inline-flex h-8 items-center gap-1 rounded-full border border-[var(--danger-border)] bg-[var(--surface-interactive)] px-2.5 text-[11px] font-medium text-[var(--danger-text)] shadow-sm transition hover:bg-[var(--danger-soft)]">
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      ) : (
        <ActionButton label="Delete" icon={<Trash2 className="h-3.5 w-3.5" />} tone="danger" />
      )}
    </form>
  );
}
