"use client";

import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, MessageSquareReply } from 'lucide-react';
import type { ReportActionState } from '@/lib/report-state';
import { CommentReportButton } from '@/components/comment-report-button';
import { AuthModal } from '@/components/auth-modal';
import { CommentForm } from '@/components/post-engagement-forms';
import { RoleBadge } from '@/components/role-badge';
import type { CommentRecord } from '@/lib/types';

function CommentActionButton({ label }: { label: string }) {
  return <button type="submit" className="min-h-10 rounded-full px-3 py-2 text-xs font-medium text-[var(--text-tertiary)] transition hover:bg-[var(--surface-interactive)] hover:text-[var(--text-primary)]">{label}</button>;
}

function CommentCard({
  comment,
  updateAction,
  deleteAction,
  reportAction,
  replyAction,
  signedIn,
  isReply = false,
}: {
  comment: CommentRecord;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  reportAction: (state: ReportActionState, formData: FormData) => Promise<ReportActionState>;
  replyAction: (formData: FormData) => Promise<void>;
  signedIn: boolean;
  isReply?: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replying, setReplying] = useState(false);
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const isEditing = editingId === comment.id;
  const replies = comment.replies ?? [];
  const replyCount = comment.replyCount ?? replies.length;

  return (
    <div className={`${isReply ? 'rounded-xl bg-transparent' : 'rounded-2xl bg-[var(--surface-muted)]'} ${isReply ? 'p-0' : 'p-4 sm:p-5'}`}>
      <div className={`flex items-start ${isReply ? 'gap-2' : 'gap-2.5'}`}>
        {comment.author.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={comment.author.avatarUrl} alt={comment.author.displayName} className={`${isReply ? 'h-6 w-6' : 'h-7 w-7'} rounded-full object-cover ring-2 ring-[var(--surface-primary)]`} />
        ) : (
          <div className={`flex ${isReply ? 'h-6 w-6' : 'h-7 w-7'} items-center justify-center rounded-full bg-[var(--accent-soft)] text-[10px] font-semibold text-[var(--accent-primary)] ring-2 ring-[var(--surface-primary)]`}>
            {comment.author.displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <Link href={`/profile/${comment.author.username}`} className="block min-w-0 flex-1 rounded-xl transition hover:bg-[var(--surface-interactive)]/70">
              <div className="flex min-w-0 items-center gap-1 sm:flex-row sm:flex-wrap sm:gap-1">
                <p className="truncate text-sm font-medium leading-5 text-[var(--text-primary)]">{comment.author.displayName}</p>
                {comment.author.badges?.includes('admin') ? <RoleBadge role="admin" /> : null}
                {!comment.author.badges?.includes('admin') && comment.author.badges?.includes('moderator') ? <RoleBadge role="moderator" /> : null}
                <p className="hidden text-xs text-[var(--text-tertiary)] sm:inline">·</p>
                <p className="hidden truncate text-xs text-[var(--text-tertiary)] sm:inline">@{comment.author.username}</p>
                <p className="hidden text-xs text-[var(--text-tertiary)] sm:inline">·</p>
                <p className="text-xs leading-5 text-[var(--text-tertiary)]">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt ? ' • edited' : ''}
                </p>
              </div>
            </Link>
            {!comment.deletedAt ? <CommentReportButton action={reportAction} commentId={comment.id} signedIn={signedIn} /> : null}
          </div>

          {comment.deletedAt ? (
            <div className="mt-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)]/70 px-4 py-3 text-sm italic text-[var(--text-tertiary)]">
              {comment.body}
            </div>
          ) : isEditing ? (
            <form action={async (formData) => {
              await updateAction(formData);
              setEditingId(null);
            }} className="mt-3 space-y-3">
              <input type="hidden" name="commentId" value={comment.id} />
              <textarea
                name="body"
                defaultValue={comment.body}
                className="min-h-28 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-[var(--text-primary)] outline-none ring-[var(--border-strong)] focus:ring"
              />
              <div className="flex items-center gap-3">
                <button type="submit" className="rounded-full bg-[var(--text-primary)] px-4 py-2 text-sm font-medium text-[var(--surface-primary)] hover:opacity-90">Save</button>
                <button type="button" onClick={() => setEditingId(null)} className="text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">Cancel</button>
              </div>
            </form>
          ) : (
            <>
              {isReply && comment.replyTarget ? (
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--accent-primary)]">Replying to {comment.replyTarget.displayName}</p>
              ) : null}
              <p className={`${isReply ? 'mt-1' : 'mt-1.5'} text-sm leading-6 text-[var(--text-secondary)]`}>{comment.body}</p>
              <div className={`${isReply ? 'mt-1' : 'mt-1.5'} flex flex-wrap items-center gap-2 sm:gap-3`}>
                {comment.canEdit ? (
                  <button type="button" onClick={() => setEditingId(comment.id)} className="min-h-10 rounded-full px-3 py-2 text-xs font-medium text-[var(--text-tertiary)] transition hover:bg-[var(--surface-interactive)] hover:text-[var(--text-primary)]">Edit</button>
                ) : null}
                {comment.canDelete ? (
                  <form action={deleteAction}>
                    <input type="hidden" name="commentId" value={comment.id} />
                    <CommentActionButton label="Delete" />
                  </form>
                ) : null}
                {!isReply ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!signedIn) {
                        setAuthOpen(true);
                        return;
                      }
                      setReplying((value) => !value);
                    }}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-[var(--accent-primary)] transition hover:bg-[var(--surface-interactive)] hover:text-[var(--accent-primary-strong)]"
                  >
                    <MessageSquareReply className="h-3.5 w-3.5" />
                    Reply
                  </button>
                ) : null}
              </div>
            </>
          )}

          {!isReply && replying ? (
            <div className="mt-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3 sm:p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Replying to {comment.author.displayName}</p>
                  <p className="mt-1 text-xs text-[var(--text-tertiary)]">Replies stay one level deep to keep threads readable.</p>
                </div>
                <button type="button" onClick={() => setReplying(false)} className="text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">Cancel</button>
              </div>
              <CommentForm action={replyAction} compact parentCommentId={comment.id} submitLabel="Post reply" pendingLabel="Posting reply..." label="Write a reply" placeholder={`Reply to ${comment.author.displayName} with something useful and specific.`} />
            </div>
          ) : null}

          {!isReply && replyCount > 0 ? (
            <div className="mt-2 border-l-2 border-[var(--border-subtle)] pl-2.5 sm:pl-3">
              {!repliesExpanded ? (
                <button
                  type="button"
                  onClick={() => setRepliesExpanded(true)}
                  className="flex w-full items-center justify-between gap-3 px-0 py-0.5 text-left text-xs font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary-strong)]"
                >
                  <span>View {replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
                  <ChevronDown className="h-4 w-4 transition" />
                </button>
              ) : null}
              {repliesExpanded ? (
                <div className="mt-1.5 space-y-1.5">
                  {replies.map((reply) => (
                    <CommentCard
                      key={reply.id}
                      comment={reply}
                      updateAction={updateAction}
                      deleteAction={deleteAction}
                      reportAction={reportAction}
                      replyAction={replyAction}
                      signedIn={signedIn}
                      isReply
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

export function CommentThread({
  comments,
  updateAction,
  deleteAction,
  reportAction,
  replyAction,
  signedIn,
}: {
  comments: CommentRecord[];
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  reportAction: (state: ReportActionState, formData: FormData) => Promise<ReportActionState>;
  replyAction: (formData: FormData) => Promise<void>;
  signedIn: boolean;
}) {
  const [authOpen, setAuthOpen] = useState(false);

  if (!comments.length) {
    return <p className="text-sm text-[var(--text-tertiary)]">No comments yet. Add the first useful reply.</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          updateAction={updateAction}
          deleteAction={deleteAction}
          reportAction={reportAction}
          replyAction={replyAction}
          signedIn={signedIn}
        />
      ))}
      {!signedIn ? (
        <>
          <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-primary)]/70 p-4 text-sm text-[var(--text-secondary)] sm:p-5">
            <p className="font-medium text-[var(--text-primary)]">Want to reply or report?</p>
            <p className="mt-1">Sign in to reply or report.</p>
            <button type="button" onClick={() => setAuthOpen(true)} className="mt-3 min-h-11 rounded-full bg-[var(--text-primary)] px-4 py-2 text-sm font-medium text-[var(--surface-primary)] hover:opacity-90">Sign in</button>
          </div>
          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </>
      ) : null}
    </div>
  );
}
