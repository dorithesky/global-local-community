"use client";

import type { ReactNode } from 'react';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { INITIAL_REPORT_ACTION_STATE, type ReportActionState } from '@/lib/report-state';

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

export function CommentForm({
  action,
  compact = false,
  parentCommentId,
  submitLabel = 'Post comment',
  pendingLabel = 'Posting...',
  label = 'Join the conversation',
  placeholder = 'Add a useful reply, answer, lead, or caution.',
}: {
  action: (formData: FormData) => Promise<void>;
  compact?: boolean;
  parentCommentId?: string;
  submitLabel?: string;
  pendingLabel?: string;
  label?: string;
  placeholder?: string;
}) {
  return (
    <form action={action} className={`space-y-3 rounded-3xl border border-slate-200 bg-white ${compact ? 'p-0 shadow-none' : 'p-4 shadow-sm sm:p-5'}`}>
      {parentCommentId ? <input type="hidden" name="parentCommentId" value={parentCommentId} /> : null}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">{label}</label>
        <textarea
          name="body"
          className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none ring-sky-200 focus:ring"
          placeholder={placeholder}
        />
      </div>
      <PendingButton label={submitLabel} pendingLabel={pendingLabel} />
    </form>
  );
}

export function ReportForm({ action, compact = false, targetLabel = 'Report this post', children, onSuccess }: { action: (state: ReportActionState, formData: FormData) => Promise<ReportActionState>; compact?: boolean; targetLabel?: string; children?: ReactNode; onSuccess?: () => void }) {
  const [state, formAction] = useActionState(action, INITIAL_REPORT_ACTION_STATE);

  useEffect(() => {
    if (state.status === 'success') {
      onSuccess?.();
    }
  }, [state.status, onSuccess]);

  return (
    <form action={formAction} className={`space-y-4 ${compact ? '' : 'rounded-2xl border border-rose-200 bg-rose-50 p-4'}`}>
      {children}
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">{targetLabel}</label>
        <select name="reason" defaultValue="" className="min-h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none ring-rose-200 focus:ring">
          <option value="" disabled>Select a reason</option>
          <option value="spam">Spam</option>
          <option value="unsafe">Unsafe or misleading</option>
          <option value="abuse">Harassment or abuse</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Details</label>
        <textarea
          name="details"
          className="min-h-28 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-3 text-sm leading-6 text-[var(--text-primary)] outline-none ring-rose-200 focus:ring"
          placeholder="Optional context for moderators."
        />
      </div>
      {state.status === 'error' ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.message ?? 'Your report could not be submitted.'}
        </div>
      ) : null}
      {state.status === 'success' ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.message ?? 'Report submitted.'}
        </div>
      ) : null}
      <PendingButton label="Submit report" pendingLabel="Submitting..." />
    </form>
  );
}
