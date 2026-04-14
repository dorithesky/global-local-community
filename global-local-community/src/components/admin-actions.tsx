"use client";

import { useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { CATEGORY_OPTIONS } from '@/lib/categories';

function AdminButton({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'danger' | 'success' }) {
  const { pending } = useFormStatus();
  const toneClass = tone === 'danger'
    ? 'border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger-text)] hover:brightness-110'
    : tone === 'success'
      ? 'border-[var(--border-strong)] bg-[var(--accent-soft)] text-[var(--accent-primary)] hover:brightness-110'
      : 'border-[var(--border-subtle)] bg-[var(--surface-interactive)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]';

  return (
    <button
      type="submit"
      disabled={pending}
      className={`min-h-10 rounded-full border px-3 py-2 text-xs font-medium disabled:opacity-60 ${toneClass}`}
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
        className="min-h-10 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-3 py-2 text-xs text-[var(--text-primary)]"
      />
      <AdminButton label={moderationStatus === 'hidden' ? 'Hide post' : 'Keep post'} tone={moderationStatus === 'hidden' ? 'danger' : 'success'} />
    </form>
  );
}

export function ModeratorNoteForm({ action, reportId, postId, commentId, targetUserId }: { action: (formData: FormData) => Promise<void>; reportId?: string; postId?: string; commentId?: string; targetUserId?: string }) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      {reportId ? <input type="hidden" name="reportId" value={reportId} /> : null}
      {postId ? <input type="hidden" name="postId" value={postId} /> : null}
      {commentId ? <input type="hidden" name="commentId" value={commentId} /> : null}
      {targetUserId ? <input type="hidden" name="targetUserId" value={targetUserId} /> : null}
      <input
        type="text"
        name="note"
        required
        placeholder="Internal note"
        className="min-h-10 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-3 py-2 text-xs text-[var(--text-primary)]"
      />
      <AdminButton label="Add note" />
    </form>
  );
}

export function UserSanctionForm({ action, userId }: { action: (formData: FormData) => Promise<void>; userId: string }) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3">
      <input type="hidden" name="userId" value={userId} />
      <select name="sanctionType" required className="min-h-10 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-3 py-2 text-xs text-[var(--text-primary)]">
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
        className="min-h-10 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-3 py-2 text-xs text-[var(--text-primary)]"
      />
      <input type="hidden" name="confirm" value="yes" />
      <input
        type="text"
        name="note"
        placeholder="Optional note"
        className="min-h-10 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-3 py-2 text-xs text-[var(--text-primary)]"
      />
      <p className="basis-full text-[11px] leading-5 text-[var(--danger-text)]">Sanctions are admin-only. Use a clear reason and apply carefully.</p>
      <AdminButton label="Apply sanction" tone="danger" />
    </form>
  );
}

export function AdminSeedPostForm({ action, authors }: { action: (formData: FormData) => Promise<void>; authors: Array<{ id: string; label: string; city: string }> }) {
  const [selectedAuthorId, setSelectedAuthorId] = useState(authors[0]?.id ?? '');
  const selectedAuthor = useMemo(() => authors.find((author) => author.id === selectedAuthorId) ?? authors[0], [authors, selectedAuthorId]);

  return (
    <form action={action} className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">Publish operator post</p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-tertiary)]">Use this for deliberate seed content from trusted operator-owned accounts only.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Author</label>
          <select
            name="authorId"
            value={selectedAuthorId}
            onChange={(event) => setSelectedAuthorId(event.target.value)}
            className="min-h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-sm text-[var(--text-primary)]"
          >
            {authors.map((author) => (
              <option key={author.id} value={author.id}>{author.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Category</label>
          <select name="category" defaultValue="housing" className="min-h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-sm text-[var(--text-primary)]">
            {CATEGORY_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">City</label>
          <input name="city" defaultValue={selectedAuthor?.city ?? 'Seoul'} className="min-h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-sm text-[var(--text-primary)]" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">District or area</label>
          <input name="district" className="min-h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-sm text-[var(--text-primary)]" placeholder="Mapo-gu, Suyeong-gu, Yuseong-gu" />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Title</label>
        <input name="title" className="min-h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-sm text-[var(--text-primary)]" placeholder="Practical post title" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Body</label>
        <textarea name="body" className="min-h-40 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-sm leading-6 text-[var(--text-primary)]" placeholder="Write the post as a useful, natural Korea-specific prompt or lead." />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Tags</label>
        <input name="tags" className="min-h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-sm text-[var(--text-primary)]" placeholder="visa, arc, seoul" />
      </div>
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-secondary)]">
        This tool is admin-only and auditable. Use it for platform-operated content, not fake user impersonation.
      </div>
      <AdminButton label="Publish seed post" tone="success" />
    </form>
  );
}

export function ContentOperatorForm({
  action,
  userId,
  active,
}: {
  action: (formData: FormData) => Promise<void>;
  userId: string;
  active: boolean;
}) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="intent" value={active ? 'revoke' : 'grant'} />
      <input
        type="text"
        name="note"
        placeholder="Optional internal note"
        className="min-h-10 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-3 py-2 text-xs text-[var(--text-primary)]"
      />
      <p className="basis-full text-[11px] leading-5 text-[var(--text-tertiary)]">Content operators can be used by the admin-only publishing tool, but they do not get admin or moderator powers.</p>
      <AdminButton label={active ? 'Remove content operator' : 'Approve content operator'} tone={active ? 'danger' : 'success'} />
    </form>
  );
}

export function UserRoleForm({
  action,
  userId,
  role,
  intent,
  requireConfirm = false,
}: {
  action: (formData: FormData) => Promise<void>;
  userId: string;
  role: 'admin' | 'moderator';
  intent: 'grant' | 'revoke';
  requireConfirm?: boolean;
}) {
  const label = intent === 'grant'
    ? `Make ${role}`
    : `Remove ${role}`;

  return (
    <form action={action} className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="intent" value={intent} />
      {requireConfirm ? <input type="hidden" name="confirm" value="yes" /> : null}
      <p className="basis-full text-[11px] leading-5 text-[var(--text-tertiary)]">
        {role === 'admin'
          ? 'Admin changes are high impact and protected against last-admin removal.'
          : 'Moderator changes control operational trust and review powers.'}
      </p>
      <AdminButton label={label} tone={intent === 'grant' ? 'success' : 'danger'} />
    </form>
  );
}
