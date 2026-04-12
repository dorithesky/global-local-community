"use client";

import { useState } from 'react';
import { AuthModal } from '@/components/auth-modal';

export function HeaderAuthControls({ signedInContent }: { signedInContent: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3">
        {signedInContent}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]"
        >
          Sign in
        </button>
      </div>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
