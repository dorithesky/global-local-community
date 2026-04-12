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
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          Sign in
        </button>
      </div>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
