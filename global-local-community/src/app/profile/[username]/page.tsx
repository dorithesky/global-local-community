import type { Metadata } from 'next';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { ServerPaginatedPostList } from '@/components/server-paginated-post-list';
import { RoleBadge } from '@/components/role-badge';
import { getCurrentMember } from '@/lib/auth';
import { getProfile, getProfileComments, getProfilePosts, getSavedPosts } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Member profile',
  description: 'Member profiles are available inside the community with limited public exposure.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      nosnippet: true,
    },
  },
  openGraph: {
    title: 'Member profile',
    description: 'Member profiles are available inside the community with limited public exposure.',
  },
  twitter: {
    card: 'summary',
    title: 'Member profile',
    description: 'Member profiles are available inside the community with limited public exposure.',
  },
};

export default async function ProfilePage({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<{ page?: string }> }) {
  noStore();
  const { username } = await params;
  const page = Math.max(Number.parseInt((await searchParams).page ?? '1', 10) || 1, 1);
  const profile = await getProfile(username);
  if (!profile) notFound();
  const authoredPosts = await getProfilePosts(username, { page, limit: 10 });
  const profileComments = await getProfileComments(username);
  const currentMember = await getCurrentMember();
  const isOwnProfile = currentMember?.username === username;
  const viewerIsMember = Boolean(currentMember);
  const savedPosts = isOwnProfile
    ? await getSavedPosts({ page: 1, limit: 10 })
    : { items: [], total: 0, page: 1, pageSize: 10, hasMore: false };
  const identitySignals = [profile.city, profile.occupation, profile.originCountry, profile.bio].filter(Boolean).length;
  const memberAgeLabel = profile.createdAt ? formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true }) : null;

  return (
    <div className="space-y-5 pb-24 lg:space-y-6 lg:pb-8">
      <PageHeader eyebrow="Profile" title={profile.displayName} description={profile.bio ? `${profile.bio} · @${profile.username}` : `@${profile.username}`} />
      <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/40 p-4 text-sm text-slate-600 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={profile.displayName} className="h-16 w-16 rounded-full object-cover ring-2 ring-sky-100" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-lg font-semibold text-sky-700 ring-2 ring-sky-100">
                {profile.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-lg font-semibold text-slate-950">{profile.displayName}</p>
                {profile.badges?.includes('admin') ? <RoleBadge role="admin" /> : null}
                {!profile.badges?.includes('admin') && profile.badges?.includes('moderator') ? <RoleBadge role="moderator" /> : null}
              </div>
              <p className="text-sm text-slate-500">@{profile.username}</p>
              <p className="mt-1 text-xs text-slate-500">{authoredPosts.total} posts • {profile.publicCommentCount ?? profileComments.length} comments</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium">
                <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-sky-800">{identitySignals >= 3 ? 'Established member context' : 'Member profile'}</span>
                {memberAgeLabel ? <span className="inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-800">Member since {memberAgeLabel}</span> : null}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="font-medium text-slate-900">City</p>
            <p>{profile.city}</p>
          </div>
          {viewerIsMember ? (
            <>
              <div>
                <p className="font-medium text-slate-900">Origin</p>
                <p>{profile.originCountry}</p>
              </div>
              <div>
                <p className="font-medium text-slate-900">Occupation</p>
                <p>{profile.occupation}</p>
              </div>
            </>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-sky-100 px-3 py-1.5 text-sky-800">{profile.city ? `Based in ${profile.city}` : 'City not set'}</span>
          {viewerIsMember ? <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-cyan-800">{profile.occupation ? profile.occupation : 'Occupation not set'}</span> : null}
          {viewerIsMember ? <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">{profile.originCountry ? `From ${profile.originCountry}` : 'Origin not set'}</span> : null}
        </div>
        {!viewerIsMember ? <p className="mt-4 text-xs leading-6 text-slate-500">Sign in to view fuller member profile context. Public profiles stay intentionally limited for safety.</p> : null}
      </section>
      {isOwnProfile ? (
        <section className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/40 p-4 text-sm text-slate-600 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <p className="font-medium text-slate-900">Your posts</p>
              <p>{authoredPosts.total}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Saved posts</p>
              <p>{savedPosts.total}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Comments</p>
              <p>{profile.publicCommentCount ?? profileComments.length}</p>
            </div>
          </div>
        </section>
      ) : null}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Posts</h2>
        <ServerPaginatedPostList
          posts={authoredPosts.items}
          page={authoredPosts.page}
          hasMore={authoredPosts.hasMore}
          emptyMessage="No posts yet."
        />
      </section>

      {viewerIsMember ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-950">Comments</h2>
          {profileComments.length ? profileComments.map((comment) => (
            <div key={comment.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm font-medium text-slate-900">{profile.displayName}</p>
              <p className="mt-1 text-xs text-slate-500">@{profile.username} • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:leading-7">{comment.body}</p>
              <div className="mt-4">
                <Link href={`/posts/${comment.postId}`} className="text-sm font-medium text-sky-700 hover:text-sky-800">Open original post</Link>
              </div>
            </div>
          )) : <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm sm:p-5">No comments yet.</div>}
        </section>
      ) : null}
    </div>
  );
}
