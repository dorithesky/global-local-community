import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { getTrendingPosts } from '@/lib/data';
import { getCurrentMember } from '@/lib/auth';
import { getAccountSettings } from '@/lib/settings';

export default async function HomePage() {
  const member = await getCurrentMember();
  const [posts, accountSettings] = await Promise.all([
    getTrendingPosts(5),
    member ? getAccountSettings() : Promise.resolve(null),
  ]);
  const recommendedCategory = accountSettings?.profile.immediateNeed || null;

  return (
    <div className="space-y-5 pb-24 lg:space-y-6 lg:pb-8">
      {member ? (
        <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-primary)]">Home</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">Pick up where you left off</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                {recommendedCategory ? `Focus on ${recommendedCategory} first, then widen out.` : 'Check recent posts or ask one clear question.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {recommendedCategory ? (
                <Link href={`/feed?category=${recommendedCategory}`} className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-interactive)] px-4 py-2.5 text-sm font-medium text-[var(--accent-primary)] hover:bg-[var(--surface-muted)]">
                  Open recommended feed
                </Link>
              ) : null}
              <Link href="/create" className="rounded-full bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-primary-strong)]">
                Ask a question
              </Link>
            </div>
          </div>
          {!accountSettings?.profile.immediateNeed || !accountSettings?.profile.occupation ? (
            <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-primary)] shadow-sm">
              <p>Finish your profile to sharpen the feed.</p>
              <Link href="/settings?onboarding=1" className="mt-2 inline-flex font-medium text-[var(--accent-primary)] underline underline-offset-4">Complete setup</Link>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-5">
          <h1 className="max-w-3xl text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">Practical help for foreigners building life in Korea.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            Housing, jobs, life-in-Korea questions, and community signals in one place.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/feed" className="rounded-full bg-[var(--accent-primary)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--accent-primary-strong)]">
              Browse posts
            </Link>
            <Link href="/#signin" className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]">
              Sign in
            </Link>
          </div>
        </section>
      )}

      <PageHeader
        eyebrow="Active now"
        title="What people are talking about"
        description={member ? 'A quick read on what is getting attention across the community.' : 'Start with the posts people are engaging with most right now.'}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={{ ...post, rank: index + 1 }} />
        ))}
      </div>

      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-primary)]">Next step</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">Open the full feed.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Browse more posts, then join where you can help or need help.</p>
          </div>
          <Link href="/feed" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary-strong)]">
            View feed <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
