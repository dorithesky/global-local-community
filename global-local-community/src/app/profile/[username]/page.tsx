import Link from 'next/link';
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
  const identitySignals = [profile.city, profile.occupation, profile.originCountry, profile.bio].filter(Boolean).length;
  const memberAgeLabel = profile.createdAt ? formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true }) : null;

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader eyebrow="Profile" title={profile.displayName} description={profile.bio ? `${profile.bio} · @${profile.username}` : `@${profile.username}`} />
      <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/40 p-6 shadow-sm text-sm text-slate-600">
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
            <div>
              <p className="text-lg font-semibold text-slate-950">{profile.displayName}</p>
              <p className="text-sm text-slate-500">@{profile.username}</p>
              <p className="mt-1 text-xs text-slate-500">{authoredPosts.length} posts • {profileComments.length} comments</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium">
                <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-sky-800">Profile context {identitySignals >= 3 ? 'complete enough to trust at a glance' : 'still growing'}</span>
                {profile.onboardingCompleted ? <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">Onboarding complete</span> : null}
                {memberAgeLabel ? <span className="inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-800">Member since {memberAgeLabel}</span> : null}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
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
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-sky-100 px-3 py-1.5 text-sky-800">{profile.city ? `Based in ${profile.city}` : 'City not set'}</span>
          <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-cyan-800">{profile.occupation ? profile.occupation : 'Occupation not set'}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">{profile.originCountry ? `From ${profile.originCountry}` : 'Origin not set'}</span>
        </div>
      </section>
      {isOwnProfile ? (
        <section className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/40 p-6 shadow-sm text-sm text-slate-600">
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
              <p>{profile.onboardingCompleted ? 'Onboarding completed' : 'Profile still needs context'}</p>
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
          <div key={comment.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-900">{profile.displayName}</p>
            <p className="mt-1 text-xs text-slate-500">@{profile.username} • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{comment.body}</p>
            <div className="mt-4">
              <Link href={`/posts/${comment.postId}`} className="text-sm font-medium text-sky-700 hover:text-sky-800">Open original post</Link>
            </div>
          </div>
        )) : <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No comments yet.</div>}
      </section>
    </div>
  );
}
