import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { PostCard } from '@/components/post-card';
import { getCategoryPosts } from '@/lib/data';
import { categories } from '@/lib/mock-data';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const categoryPosts = await getCategoryPosts(slug);

  return (
    <div className="space-y-4 pb-24 lg:pb-8">
      <PageHeader eyebrow="Category" title={category.label} description={category.description} />
      {categoryPosts.length ? categoryPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      )) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm sm:p-6">
          No posts are visible in this category yet.
        </section>
      )}
    </div>
  );
}
