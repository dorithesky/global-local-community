import { posts as mockPosts } from './mock-data';
import { getSupabaseAdminClient } from './supabase-admin';

const AUTHOR_ID_BY_USERNAME: Record<string, string> = {
  'mina-expat': '00000000-0000-0000-0000-000000000001',
  jaynomad: '00000000-0000-0000-0000-000000000002',
  'sara-abroad': '00000000-0000-0000-0000-000000000003',
};

export async function seedDemoPostsIfNeeded() {
  const admin = getSupabaseAdminClient();
  if (!admin) return { seeded: false, reason: 'missing-config' };

  const { count, error: countError } = await admin.from('posts').select('*', { count: 'exact', head: true });
  if (countError) return { seeded: false, reason: countError.message };
  if ((count ?? 0) >= 30) return { seeded: false, reason: 'already-seeded', count };

  const postRows = mockPosts.map((post) => ({
    author_id: AUTHOR_ID_BY_USERNAME[post.author.username],
    category: post.category,
    title: post.title,
    body: post.body,
    city: post.city,
    district: post.district,
    tags: post.tags,
    ai_label: post.analysis.label,
    ai_score: post.analysis.score,
    ai_explanation: post.analysis.explanation,
  }));

  const { error: postsError } = await admin.from('posts').insert(postRows);
  if (postsError) return { seeded: false, reason: postsError.message };

  return { seeded: true, count: postRows.length };
}
