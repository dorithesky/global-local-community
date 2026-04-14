"use client";

import { useState } from 'react';
import { Flag } from 'lucide-react';
import type { ReportActionState } from '@/lib/report-state';
import { AuthModal } from '@/components/auth-modal';
import { ReportModal } from '@/components/report-modal';

export function PostDetailReportTrigger({ action, signedIn }: { action: (state: ReportActionState, formData: FormData) => Promise<ReportActionState>; signedIn: boolean }) {
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
        className="inline-flex h-5 w-5 items-center justify-center text-[var(--danger-text)] transition hover:text-[var(--danger-text)]/80"
      >
        <Flag className="h-3 w-3" />
      </button>
      <ReportModal
        open={open}
        onClose={() => setOpen(false)}
        action={action}
        title="Report post"
        description="Tell moderators what is wrong with this post."
        targetLabel="Why are you reporting this post?"
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
