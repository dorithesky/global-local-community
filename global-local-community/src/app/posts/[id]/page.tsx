import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Bookmark, Heart, MessageCircle, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { CommentForm, ReportForm } from '@/components/post-engagement-forms';
import { cityScopeLabel } from '@/lib/locations';
import { getPost, getPostComments } from '@/lib/data';
import { createCommentAction, createReportAction } from './actions';

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  const comments = await getPostComments(id);

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader eyebrow={post.category} title={post.title} description={`Posted by ${post.author.displayName} in ${cityScopeLabel(post.city, post.district)}.`} />
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>@{post.author.username}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          <span>•</span>
          <span>{cityScopeLabel(post.city, post.district)}</span>
        </div>
        <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{post.body}</div>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4" /> {post.likesCount} likes</span>
          <span className="inline-flex items-center gap-2"><Bookmark className="h-4 w-4" /> {post.bookmarked ? 'Saved' : 'Not saved'}</span>
          <span className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> {post.commentsCount} comments</span>
          <span className="inline-flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Report</span>
        </div>
        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-900">AI moderation + classification</p>
          <p className="mt-2">Label: {post.analysis.label}</p>
          <p>Score: {post.analysis.score.toFixed(2)}</p>
          <p>Why: {post.analysis.explanation}</p>
        </div>
      </article>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Comments</h2>
          <div className="mt-4 space-y-4">
            {comments.length ? comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">{comment.author.displayName}</p>
                <p className="mt-1 text-xs text-slate-500">@{comment.author.username}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{comment.body}</p>
              </div>
            )) : <p className="text-sm text-slate-500">No comments yet. Add the first useful reply.</p>}
          </div>
        </div>
        <div className="space-y-4">
          <CommentForm action={createCommentAction.bind(null, id)} />
          <ReportForm action={createReportAction.bind(null, id)} />
        </div>
      </section>
    </div>
  );
}
