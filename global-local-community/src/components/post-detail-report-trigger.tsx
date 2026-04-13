"use client";

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { AuthModal } from '@/components/auth-modal';
import { ReportModal } from '@/components/report-modal';

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
          setOpen(true);
        }}
        aria-label="Report post"
        title="Report post"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-700"
      >
        <Flag className="h-4 w-4" />
      </button>
      <ReportModal
        open={open}
        onClose={() => setOpen(false)}
        action={action}
        title="Report post"
        description="Let moderators know what feels unsafe, misleading, abusive, or out of place."
        targetLabel="Why are you reporting this post?"
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
