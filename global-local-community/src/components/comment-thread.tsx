"use client";

import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, MessageSquareReply } from 'lucide-react';
import { CommentReportButton } from '@/components/comment-report-button';
import { AuthModal } from '@/components/auth-modal';
import { CommentForm } from '@/components/post-engagement-forms';
import type { CommentRecord } from '@/lib/types';

function CommentActionButton({ label }: { label: string }) {
  return <button type="submit" className="min-h-10 rounded-full px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-white hover:text-slate-900">{label}</button>;
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
  reportAction: (formData: FormData) => Promise<void>;
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
  const previewReplies = repliesExpanded ? replies : replies.slice(0, 2);
  const hasHiddenReplies = replies.length > previewReplies.length;

  return (
    <div className={`${isReply ? 'rounded-xl bg-transparent' : 'rounded-2xl bg-slate-50'} ${isReply ? 'p-0' : 'p-4 sm:p-5'}`}>
      <div className={`flex items-start ${isReply ? 'gap-2' : 'gap-2.5'}`}>
        {comment.author.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={comment.author.avatarUrl} alt={comment.author.displayName} className={`${isReply ? 'h-7.5 w-7.5' : 'h-8 w-8'} rounded-full object-cover ring-2 ring-white`} />
        ) : (
          <div className={`flex ${isReply ? 'h-7.5 w-7.5' : 'h-8 w-8'} items-center justify-center rounded-full bg-sky-100 text-[11px] font-semibold text-sky-700 ring-2 ring-white`}>
            {comment.author.displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <Link href={`/profile/${comment.author.username}`} className="block min-w-0 flex-1 rounded-xl transition hover:bg-white/70">
              <div className="flex min-w-0 items-center gap-1 sm:flex-row sm:flex-wrap sm:gap-1">
                <p className="truncate text-sm font-medium leading-5 text-slate-900">{comment.author.displayName}</p>
                <p className="hidden text-xs text-slate-500 sm:inline">·</p>
                <p className="hidden truncate text-xs text-slate-500 sm:inline">@{comment.author.username}</p>
                <p className="hidden text-xs text-slate-500 sm:inline">·</p>
                <p className="text-xs leading-5 text-slate-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt ? ' • edited' : ''}
                </p>
              </div>
            </Link>
            {!comment.deletedAt ? <CommentReportButton action={reportAction} commentId={comment.id} signedIn={signedIn} /> : null}
          </div>

          {comment.deletedAt ? (
            <div className="mt-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm italic text-slate-500">
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
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-sky-200 focus:ring"
              />
              <div className="flex items-center gap-3">
                <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Save</button>
                <button type="button" onClick={() => setEditingId(null)} className="text-sm font-medium text-slate-500 hover:text-slate-900">Cancel</button>
              </div>
            </form>
          ) : (
            <>
              {isReply && comment.replyTarget ? (
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-sky-700">Replying to {comment.replyTarget.displayName}</p>
              ) : null}
              <p className={`${isReply ? 'mt-1' : 'mt-1.5'} text-sm leading-6 text-slate-600`}>{comment.body}</p>
              <div className={`${isReply ? 'mt-1' : 'mt-1.5'} flex flex-wrap items-center gap-2 sm:gap-3`}>
                {comment.canEdit ? (
                  <>
                    <button type="button" onClick={() => setEditingId(comment.id)} className="min-h-10 rounded-full px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-white hover:text-slate-900">Edit</button>
                    <form action={deleteAction}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <CommentActionButton label="Delete" />
                    </form>
                  </>
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
                    className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-sky-700 transition hover:bg-white hover:text-sky-800"
                  >
                    <MessageSquareReply className="h-3.5 w-3.5" />
                    Reply
                  </button>
                ) : null}
              </div>
            </>
          )}

          {!isReply && replying ? (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Replying to {comment.author.displayName}</p>
                  <p className="mt-1 text-xs text-slate-400">Replies stay one level deep to keep threads readable.</p>
                </div>
                <button type="button" onClick={() => setReplying(false)} className="text-xs font-medium text-slate-500 hover:text-slate-900">Cancel</button>
              </div>
              <CommentForm action={replyAction} compact parentCommentId={comment.id} submitLabel="Post reply" pendingLabel="Posting reply..." label="Write a reply" placeholder={`Reply to ${comment.author.displayName} with something useful and specific.`} />
            </div>
          ) : null}

          {!isReply && replyCount > 0 ? (
            <div className="mt-2 border-l-2 border-slate-200 pl-2.5 sm:pl-3">
              {!repliesExpanded ? (
                <button
                  type="button"
                  onClick={() => setRepliesExpanded(true)}
                  className="flex w-full items-center justify-between gap-3 px-0 py-0.5 text-left text-xs font-medium text-sky-700 hover:text-sky-800"
                >
                  <span>View {replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
                  <ChevronDown className="h-4 w-4 transition" />
                </button>
              ) : null}
              {repliesExpanded ? (
                <div className="mt-1.5 space-y-1.5">
                  {previewReplies.map((reply) => (
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
                  {hasHiddenReplies ? (
                    <button
                      type="button"
                      onClick={() => setRepliesExpanded(true)}
                      className="mt-2 text-xs font-medium text-sky-700 hover:text-sky-800"
                    >
                      Show {replies.length - previewReplies.length} more
                    </button>
                  ) : null}
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
  reportAction: (formData: FormData) => Promise<void>;
  replyAction: (formData: FormData) => Promise<void>;
  signedIn: boolean;
}) {
  const [authOpen, setAuthOpen] = useState(false);

  if (!comments.length) {
    return <p className="text-sm text-slate-500">No comments yet. Add the first useful reply.</p>;
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
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-600 sm:p-5">
            <p className="font-medium text-slate-900">Want to reply or report?</p>
            <p className="mt-1">Sign in first so community actions stay tied to a real profile.</p>
            <button type="button" onClick={() => setAuthOpen(true)} className="mt-3 min-h-11 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Sign in</button>
          </div>
          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </>
      ) : null}
    </div>
  );
}
