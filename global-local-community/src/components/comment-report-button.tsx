"use client";

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { AuthModal } from '@/components/auth-modal';
import { ReportModal } from '@/components/report-modal';

export function CommentReportButton({ action, commentId, signedIn }: { action: (formData: FormData) => Promise<void>; commentId: string; signedIn: boolean }) {
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
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-transparent text-rose-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
      >
        <Flag className="h-4 w-4" />
      </button>
      <ReportModal
        open={open}
        onClose={() => setOpen(false)}
        action={action}
        title="Report comment"
        description="Send a private moderation report without disrupting the conversation layout."
        targetLabel="Why are you reporting this comment?"
      >
        <input type="hidden" name="commentId" value={commentId} />
      </ReportModal>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
