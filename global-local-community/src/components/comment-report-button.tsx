"use client";

import { useState } from 'react';
import { Flag } from 'lucide-react';
import type { ReportActionState } from '@/lib/report-state';
import { AuthModal } from '@/components/auth-modal';
import { ReportModal } from '@/components/report-modal';

export function CommentReportButton({ action, commentId, signedIn }: { action: (state: ReportActionState, formData: FormData) => Promise<ReportActionState>; commentId: string; signedIn: boolean }) {
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
        aria-label="Report comment"
        title="Report comment"
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-[var(--danger-text)] transition hover:text-[var(--danger-text)]/80"
      >
        <Flag className="h-3 w-3" />
      </button>
      <ReportModal
        open={open}
        onClose={() => setOpen(false)}
        action={action}
        title="Report comment"
        description="Tell moderators what is wrong with this comment."
        targetLabel="Why are you reporting this comment?"
      >
        <input type="hidden" name="commentId" value={commentId} />
      </ReportModal>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
