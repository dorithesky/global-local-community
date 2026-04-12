"use client";

import { useFormStatus } from 'react-dom';

function AdminButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
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
      <AdminButton label={status === 'reviewing' ? 'Mark reviewing' : 'Resolve'} />
    </form>
  );
}

export function HidePostForm({ postId, action }: { postId: string; action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action}>
      <input type="hidden" name="postId" value={postId} />
      <AdminButton label="Hide post" />
    </form>
  );
}
