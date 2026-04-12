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
      <input
        type="text"
        name="note"
        placeholder="Optional moderator note"
        className="rounded-full border border-slate-300 px-3 py-2 text-xs text-slate-700"
      />
      <AdminButton label={moderationStatus === 'hidden' ? 'Hide post' : 'Keep post'} tone={moderationStatus === 'hidden' ? 'danger' : 'success'} />
    </form>
  );
}

export function ModeratorNoteForm({ action, reportId, postId, targetUserId }: { action: (formData: FormData) => Promise<void>; reportId?: string; postId?: string; targetUserId?: string }) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      {reportId ? <input type="hidden" name="reportId" value={reportId} /> : null}
      {postId ? <input type="hidden" name="postId" value={postId} /> : null}
      {targetUserId ? <input type="hidden" name="targetUserId" value={targetUserId} /> : null}
      <input
        type="text"
        name="note"
        required
        placeholder="Internal note"
        className="rounded-full border border-slate-300 px-3 py-2 text-xs text-slate-700"
      />
      <AdminButton label="Add note" />
    </form>
  );
}

export function UserSanctionForm({ action, userId }: { action: (formData: FormData) => Promise<void>; userId: string }) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <select name="sanctionType" required className="rounded-full border border-slate-300 px-3 py-2 text-xs text-slate-700">
        <option value="warn">Warn</option>
        <option value="mute">Mute</option>
        <option value="suspend">Suspend</option>
        <option value="ban">Ban</option>
      </select>
      <input
        type="text"
        name="reason"
        required
        placeholder="Reason"
        className="rounded-full border border-slate-300 px-3 py-2 text-xs text-slate-700"
      />
      <input
        type="text"
        name="note"
        placeholder="Optional note"
        className="rounded-full border border-slate-300 px-3 py-2 text-xs text-slate-700"
      />
      <AdminButton label="Apply sanction" tone="danger" />
    </form>
  );
}
