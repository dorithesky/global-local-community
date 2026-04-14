import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import { cityScopeLabel } from '@/lib/locations';
import { RoleBadge } from '@/components/role-badge';
import type { PostRecord } from '@/lib/types';

export function PostListItem({ post }: { post: PostRecord }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="block rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:px-4 sm:py-3"
    >
      <div className="flex items-start gap-2.5">
        {post.author.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.author.avatarUrl} alt={post.author.displayName} className="h-8 w-8 rounded-full object-cover ring-2 ring-[var(--border-subtle)]" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[12px] font-semibold text-[var(--accent-primary)] ring-2 ring-[var(--border-subtle)]">
            {post.author.displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{post.author.displayName}</p>
            {post.author.badges?.includes('admin') ? <RoleBadge role="admin" /> : null}
            {!post.author.badges?.includes('admin') && post.author.badges?.includes('moderator') ? <RoleBadge role="moderator" /> : null}
          </div>
          <p className="mt-0.5 text-[11px] leading-4 text-[var(--text-tertiary)]">
            @{post.author.username} • {cityScopeLabel(post.city, post.district)} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="rounded-full bg-[var(--accent-soft)]/70 px-2 py-0.5 text-[10px] font-semibold leading-none text-[var(--accent-primary)]">{post.category}</span>
            {post.author.city ? <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-medium leading-none text-[var(--text-secondary)]">{post.author.city}</span> : null}
          </div>
        </div>
        <div className="hidden shrink-0 items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)] sm:inline-flex">
          <MessageCircle className="h-3.5 w-3.5" />
          {post.commentsCount}
        </div>
      </div>
      <div className="mt-2 min-w-0">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">{post.title}</h2>
        <p className="mt-1 line-clamp-1 text-[13px] leading-5 text-[var(--text-secondary)]">{post.body}</p>
      </div>
    </Link>
  );
}
