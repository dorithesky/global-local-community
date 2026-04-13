"use client";

import { useState } from 'react';
import { AuthModal } from '@/components/auth-modal';

export function HeaderAuthControls({ signedInContent, compact = false }: { signedInContent: React.ReactNode; compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex max-w-full items-center gap-2 sm:gap-3">
        {signedInContent}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${compact ? 'min-h-10 px-3.5 py-2 text-sm' : 'min-h-11 px-4 py-2.5 text-sm'} rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] font-medium text-[var(--text-primary)] shadow-sm transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]`}
        >
          Sign in
        </button>
      </div>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
