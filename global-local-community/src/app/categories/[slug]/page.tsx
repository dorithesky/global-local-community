import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { ServerPaginatedPostList } from '@/components/server-paginated-post-list';
import { getCategoryPosts } from '@/lib/data';
import { categories } from '@/lib/mock-data';
import { getGroupCategories, TOP_LEVEL_NAV_GROUPS } from '@/lib/categories';

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params;
  const page = Math.max(Number.parseInt((await searchParams).page ?? '1', 10) || 1, 1);
  const category = categories.find((item) => item.slug === slug);
  const categoryGroup = TOP_LEVEL_NAV_GROUPS.find((item) => item.slug === slug);
  if (!category && !categoryGroup) notFound();
  const categoryPosts = category
    ? await getCategoryPosts(slug, { page, limit: 10 })
    : await getCategoryPosts(getGroupCategories(slug as 'housing' | 'jobs' | 'life-in-korea' | 'community'), { page, limit: 10 });

  return (
    <div className="space-y-4 pb-24 lg:pb-8">
      <PageHeader eyebrow="Category" title={category?.label ?? categoryGroup?.label ?? 'Category'} description={category?.description ?? categoryGroup?.description ?? ''} />
      <ServerPaginatedPostList
        posts={categoryPosts.items}
        page={categoryPosts.page}
        hasMore={categoryPosts.hasMore}
        emptyMessage="No posts are visible in this category yet."
        itemLabel={`${(category?.label ?? categoryGroup?.label ?? 'category').toLowerCase()} posts`}
      />
    </div>
  );
}
