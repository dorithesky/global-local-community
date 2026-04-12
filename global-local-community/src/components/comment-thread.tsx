"use client";

import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CommentReportButton } from '@/components/comment-report-button';
import { AuthModal } from '@/components/auth-modal';
import type { CommentRecord } from '@/lib/types';

function CommentActionButton({ label }: { label: string }) {
  return <button type="submit" className="text-xs font-medium text-slate-500 transition hover:text-slate-900">{label}</button>;
}

export function CommentThread({
  comments,
  updateAction,
  deleteAction,
  reportAction,
}: {
  comments: CommentRecord[];
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  reportAction: (formData: FormData) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  if (!comments.length) {
    return <p className="text-sm text-slate-500">No comments yet. Add the first useful reply.</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isEditing = editingId === comment.id;
        return (
          <div key={comment.id} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              {comment.author.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={comment.author.avatarUrl} alt={comment.author.displayName} className="h-9 w-9 rounded-full object-cover ring-2 ring-white" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700 ring-2 ring-white">
                  {comment.author.displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Link href={`/profile/${comment.author.username}`} className="block rounded-xl transition hover:bg-white/70">
                  <p className="text-sm font-medium text-slate-900">{comment.author.displayName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    @{comment.author.username} • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    {comment.updatedAt && comment.updatedAt !== comment.createdAt ? ' • edited' : ''}
                  </p>
                </Link>

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
                    <p className="mt-2 text-sm leading-6 text-slate-600">{comment.body}</p>
                    {comment.canEdit ? (
                      <div className="mt-3 flex items-center gap-4">
                        <button type="button" onClick={() => setEditingId(comment.id)} className="text-xs font-medium text-slate-500 transition hover:text-slate-900">Edit</button>
                        <form action={deleteAction}>
                          <input type="hidden" name="commentId" value={comment.id} />
                          <CommentActionButton label="Delete" />
                        </form>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-slate-400">Only the author can edit or delete this reply.</p>
                    )}
                    {!comment.deletedAt ? <CommentReportButton action={reportAction} commentId={comment.id} /> : null}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-900">Want to reply or report?</p>
        <p className="mt-1">Sign in first so community actions stay tied to a real profile.</p>
        <button type="button" onClick={() => setAuthOpen(true)} className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Sign in</button>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
