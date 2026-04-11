import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { getProfileByUsername, posts } from '@/lib/mock-data';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = getProfileByUsername(username);
  if (!profile) notFound();
  const authoredPosts = posts.filter((post) => post.author.username === username);

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      <PageHeader eyebrow="Profile" title={profile.displayName} description={profile.bio ?? 'Community member'} />
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
      <div className="space-y-4">
        {authoredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
