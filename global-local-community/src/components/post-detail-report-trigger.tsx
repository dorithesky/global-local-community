"use client";

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { ReportForm } from '@/components/post-engagement-forms';
import { AuthModal } from '@/components/auth-modal';

export function PostDetailReportTrigger({ action, signedIn }: { action: (formData: FormData) => Promise<void>; signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => {
          if (!signedIn) {
            setAuthOpen(true);
            return;
          }
          setOpen((value) => !value);
        }}
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
      >
        <Flag className="h-4 w-4" />
        {signedIn ? (open ? 'Close report' : 'Report') : 'Sign in to report'}
      </button>
      {signedIn && open ? <ReportForm action={action} compact /> : null}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
