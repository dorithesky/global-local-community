"use client";

import { useFormStatus } from 'react-dom';

function AdminButton({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'danger' | 'success' }) {
  const { pending } = useFormStatus();
  const toneClass = tone === 'danger'
    ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
    : tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50';

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full border px-3 py-2 text-xs font-medium disabled:opacity-60 ${toneClass}`}
    >
      {pending ? 'Saving...' : label}
    </button>
  );
}

export function ReportStatusForm({ reportId, status, action }: { reportId: string; status: string; action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="reportId" value={reportId} />
      <input type="hidden" name="status" value={status} />
      <AdminButton label={status === 'reviewing' ? 'Mark reviewing' : 'Resolve'} tone={status === 'resolved' ? 'success' : 'neutral'} />
    </form>
  );
}

export function PostVisibilityForm({ postId, moderationStatus, action }: { postId: string; moderationStatus: 'published' | 'hidden'; action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="moderationStatus" value={moderationStatus} />
      <AdminButton label={moderationStatus === 'hidden' ? 'Hide post' : 'Keep post'} tone={moderationStatus === 'hidden' ? 'danger' : 'success'} />
    </form>
  );
}
