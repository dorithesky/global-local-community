"use client";

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { ReportForm } from '@/components/post-engagement-forms';
import { AuthModal } from '@/components/auth-modal';

export function PostDetailReportTrigger({ action, signedIn }: { action: (formData: FormData) => Promise<void>; signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!signedIn) {
            setAuthOpen(true);
            return;
          }
          setOpen((value) => !value);
        }}
        aria-label={signedIn ? (open ? 'Close report form' : 'Report post') : 'Sign in to report post'}
        title={signedIn ? (open ? 'Close report form' : 'Report post') : 'Sign in to report post'}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-700"
      >
        <Flag className="h-4 w-4" />
      </button>
      {signedIn && open ? <ReportForm action={action} compact /> : null}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
