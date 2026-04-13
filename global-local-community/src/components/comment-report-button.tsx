"use client";

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { ReportForm } from '@/components/post-engagement-forms';
import { AuthModal } from '@/components/auth-modal';

export function CommentReportButton({ action, commentId, signedIn }: { action: (formData: FormData) => Promise<void>; commentId: string; signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="mt-3 space-y-2">
      <button
        type="button"
        onClick={() => {
          if (!signedIn) {
            setAuthOpen(true);
            return;
          }
          setOpen((value) => !value);
        }}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
      >
        <Flag className="h-3.5 w-3.5" />
        {signedIn ? (open ? 'Cancel report' : 'Report comment') : 'Sign in to report'}
      </button>
      {signedIn && open ? (
        <div className="max-w-xl min-w-0">
          <ReportForm action={action} compact targetLabel="Report this comment">
            <input type="hidden" name="commentId" value={commentId} />
          </ReportForm>
        </div>
      ) : null}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
