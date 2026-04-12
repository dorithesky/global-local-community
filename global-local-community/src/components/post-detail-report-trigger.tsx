"use client";

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { ReportForm } from '@/components/post-engagement-forms';

export function PostDetailReportTrigger({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
      >
        <Flag className="h-4 w-4" />
        {open ? 'Close report' : 'Report'}
      </button>
      {open ? <ReportForm action={action} compact /> : null}
    </div>
  );
}
