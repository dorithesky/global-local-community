import { posts as mockPosts } from './mock-data';
import { getSupabaseAdminClient } from './supabase-admin';

const profileRows = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'mina-expat',
    display_name: 'Mina Carter',
    bio: 'Community host for newcomers in Daegu.',
    city: 'Daegu',
    origin_country: 'Canada',
    occupation: 'Teacher',
    onboarding_completed: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    username: 'jaynomad',
    display_name: 'Jay Park',
    bio: 'Sharing practical Korea life tips.',
    city: 'Daegu',
    origin_country: 'USA',
    occupation: 'Designer',
    onboarding_completed: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    username: 'sara-abroad',
    display_name: 'Sara Kim',
    bio: 'Helping people find housing and jobs.',
    city: 'Daegu',
    origin_country: 'UK',
    occupation: 'Recruiter',
    onboarding_completed: true,
  },
];

export async function seedDemoPostsIfNeeded() {
  const admin = getSupabaseAdminClient();
  if (!admin) return { seeded: false, reason: 'missing-config' };

  const { count, error: countError } = await admin.from('posts').select('*', { count: 'exact', head: true });
  if (countError) return { seeded: false, reason: countError.message };
  if ((count ?? 0) >= 30) return { seeded: false, reason: 'already-seeded', count };

  const { error: profilesError } = await admin.from('profiles').upsert(profileRows, { onConflict: 'id' });
  if (profilesError) return { seeded: false, reason: profilesError.message };

  const postRows = mockPosts.map((post) => ({
    author_id:
      post.author.username === 'mina-expat'
        ? '00000000-0000-0000-0000-000000000001'
        : post.author.username === 'jaynomad'
          ? '00000000-0000-0000-0000-000000000002'
          : '00000000-0000-0000-0000-000000000003',
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
