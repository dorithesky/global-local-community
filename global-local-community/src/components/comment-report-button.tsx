"use client";

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { ReportForm } from '@/components/post-engagement-forms';
import { AuthModal } from '@/components/auth-modal';

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
          setOpen((value) => !value);
        }}
        aria-label={signedIn ? (open ? 'Close report form' : 'Report comment') : 'Sign in to report comment'}
        title={signedIn ? (open ? 'Close report form' : 'Report comment') : 'Sign in to report comment'}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-transparent text-rose-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
      >
        <Flag className="h-4 w-4" />
      </button>
      {signedIn && open ? (
        <div className="mt-3 max-w-xl min-w-0">
          <ReportForm action={action} compact targetLabel="Report this comment">
            <input type="hidden" name="commentId" value={commentId} />
          </ReportForm>
        </div>
      ) : null}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
