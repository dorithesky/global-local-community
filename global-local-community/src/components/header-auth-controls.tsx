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
          className={`${compact ? 'min-h-10 px-3.5 py-2 text-sm' : 'min-h-11 px-4 py-2.5 text-sm'} rounded-full border border-sky-200 bg-sky-50 font-semibold text-sky-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-100 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-900/50`}
        >
          Sign in
        </button>
      </div>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
