"use client";

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

function PendingButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function CommentForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">Join the conversation</label>
        <textarea
          name="body"
          className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none ring-sky-200 focus:ring"
          placeholder="Add a useful reply, answer, lead, or caution."
        />
      </div>
      <PendingButton label="Post comment" pendingLabel="Posting..." />
    </form>
  );
}

export function ReportForm({ action, compact = false, targetLabel = 'Report this post', children }: { action: (formData: FormData) => Promise<void>; compact?: boolean; targetLabel?: string; children?: ReactNode }) {
  return (
    <form action={action} className={`space-y-3 rounded-2xl border border-rose-200 bg-rose-50 ${compact ? 'p-4' : 'p-4'}`}>
      {children}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-900">{targetLabel}</label>
        <select name="reason" defaultValue="" className="min-h-11 w-full rounded-2xl border border-rose-200 px-4 py-3 text-sm outline-none ring-rose-200 focus:ring">
          <option value="" disabled>Select a reason</option>
          <option value="spam">Spam</option>
          <option value="unsafe">Unsafe or misleading</option>
          <option value="abuse">Harassment or abuse</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-900">Details</label>
        <textarea
          name="details"
          className="min-h-24 w-full rounded-2xl border border-rose-200 px-4 py-3 text-sm leading-6 outline-none ring-rose-200 focus:ring"
          placeholder="Optional context for moderators."
        />
      </div>
      <PendingButton label="Submit report" pendingLabel="Submitting..." />
    </form>
  );
}
