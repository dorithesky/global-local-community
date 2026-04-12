"use client";

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { ReportForm } from '@/components/post-engagement-forms';

export function CommentReportButton({ action, commentId }: { action: (formData: FormData) => Promise<void>; commentId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 space-y-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 transition hover:text-rose-700"
      >
        <Flag className="h-3.5 w-3.5" />
        {open ? 'Cancel report' : 'Report comment'}
      </button>
      {open ? (
        <div className="max-w-xl">
          <ReportForm action={action} compact targetLabel="Report this comment">
            <input type="hidden" name="commentId" value={commentId} />
          </ReportForm>
        </div>
      ) : null}
    </div>
  );
}
