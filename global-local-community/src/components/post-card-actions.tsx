"use client";

import { Bookmark, Heart, Trash2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function ActionButton({ label, icon, tone = 'neutral', type = 'submit', onClick }: { label: string; icon: React.ReactNode; tone?: 'neutral' | 'danger'; type?: 'button' | 'submit'; onClick?: () => void }) {
  const { pending } = useFormStatus();
  const toneClass = tone === 'danger'
    ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
    : 'border-sky-200 bg-white text-sky-700 hover:bg-sky-50';

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
        <button type="submit" className="inline-flex h-8 items-center gap-1 rounded-full border border-rose-200 bg-white px-2.5 text-[11px] font-medium text-rose-700 shadow-sm transition hover:bg-rose-50">
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      ) : (
        <ActionButton label="Delete" icon={<Trash2 className="h-3.5 w-3.5" />} tone="danger" />
      )}
    </form>
  );
}
