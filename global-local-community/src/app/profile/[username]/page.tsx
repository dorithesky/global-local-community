import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { getCurrentMember } from '@/lib/auth';
import { getProfile, getProfileComments, getProfilePosts, getSavedPosts } from '@/lib/data';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) notFound();
  const authoredPosts = await getProfilePosts(username);
  const profileComments = await getProfileComments(username);
  const currentMember = await getCurrentMember();
  const isOwnProfile = currentMember?.username === username;
  const savedPosts = isOwnProfile ? await getSavedPosts() : [];

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader eyebrow="Profile" title={profile.displayName} description={profile.bio ? `${profile.bio} · @${profile.username}` : `@${profile.username}`} />
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-600">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <p className="font-medium text-slate-900">City</p>
            <p>{profile.city}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Origin</p>
            <p>{profile.originCountry}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Occupation</p>
            <p>{profile.occupation}</p>
          </div>
        </div>
      </section>
      {isOwnProfile ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-600">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="font-medium text-slate-900">Your posts</p>
              <p>{authoredPosts.length}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Saved posts</p>
              <p>{savedPosts.length}</p>
            </div>
            <div>
              <p className="font-medium text-slate-900">Account state</p>
              <p>Signed in and active</p>
            </div>
          </div>
        </section>
      ) : null}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Posts</h2>
        {authoredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Comments</h2>
        {profileComments.length ? profileComments.map((comment) => (
          <div key={comment.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-900">{profile.displayName}</p>
            <p className="mt-1 text-xs text-slate-500">@{profile.username} • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{comment.body}</p>
          </div>
        )) : <div className="rounded-[28px] border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No comments yet.</div>}
      </section>
    </div>
  );
}
