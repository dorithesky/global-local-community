import { getSupabaseServerClient } from './supabase-server';
import { getCommentsByPostId, getPostById, getPostsByCategory, getProfileByUsername, posts as mockPosts } from './mock-data';
import type { CommentRecord, PostRecord, Profile } from './types';

function normalizeProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    username: String(row.username ?? ''),
    displayName: String(row.display_name ?? ''),
    bio: row.bio ? String(row.bio) : undefined,
    city: String(row.city ?? 'Daegu'),
    originCountry: row.origin_country ? String(row.origin_country) : undefined,
    occupation: row.occupation ? String(row.occupation) : undefined,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
  };
}

function normalizePost(row: Record<string, unknown>, profile: Profile): PostRecord {
  return {
    id: String(row.id),
    author: profile,
    category: row.category as PostRecord['category'],
    title: String(row.title),
    body: String(row.body),
    city: String(row.city ?? 'Daegu'),
    district: row.district ? String(row.district) : undefined,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    createdAt: String(row.created_at ?? new Date().toISOString()),
    likesCount: Number(row.likes_count ?? 0),
    commentsCount: Number(row.comments_count ?? 0),
    bookmarked: false,
    analysis: {
      label: (row.ai_label as PostRecord['analysis']['label']) ?? 'daily-life',
      score: Number(row.ai_score ?? 0),
      explanation: String(row.ai_explanation ?? 'No explanation available.'),
    },
  };
}

export async function getFeedPosts(): Promise<PostRecord[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return mockPosts;

  const { data, error } = await supabase
    .from('posts')
    .select('id, author_id, category, title, body, city, district, tags, ai_label, ai_score, ai_explanation, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data?.length) return mockPosts;

  const authorIds = [...new Set(data.map((row) => row.author_id))];
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, city, origin_country, occupation, avatar_url')
    .in('id', authorIds);

  const profileMap = new Map((profilesData ?? []).map((row) => [row.id, normalizeProfile(row)]));

  return data.map((row) => normalizePost(row, profileMap.get(row.author_id) ?? {
    id: String(row.author_id),
    username: 'unknown',
    displayName: 'Unknown member',
    city: String(row.city ?? 'Daegu'),
  }));
}

export async function getPost(id: string): Promise<PostRecord | undefined> {
  const feed = await getFeedPosts();
  return feed.find((post) => post.id === id) ?? getPostById(id);
}

export async function getCategoryPosts(category: string): Promise<PostRecord[]> {
  const feed = await getFeedPosts();
  const matches = feed.filter((post) => post.category === category);
  return matches.length ? matches : getPostsByCategory(category);
}

export async function getProfile(username: string): Promise<Profile | undefined> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return getProfileByUsername(username);

  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, city, origin_country, occupation, avatar_url')
    .eq('username', username)
    .maybeSingle();

  return data ? normalizeProfile(data) : getProfileByUsername(username);
}

export async function getProfilePosts(username: string): Promise<PostRecord[]> {
  const feed = await getFeedPosts();
  return feed.filter((post) => post.author.username === username);
}

export async function getPostComments(postId: string): Promise<CommentRecord[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return getCommentsByPostId(postId);

  const { data, error } = await supabase
    .from('comments')
    .select('id, post_id, body, created_at, author_id')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error || !data?.length) return getCommentsByPostId(postId);

  const authorIds = [...new Set(data.map((row) => row.author_id))];
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, city, origin_country, occupation, avatar_url')
    .in('id', authorIds);

  const profileMap = new Map((profilesData ?? []).map((row) => [row.id, normalizeProfile(row)]));

  return data.map((row) => ({
    id: row.id,
    postId: row.post_id,
    body: row.body,
    createdAt: row.created_at,
    author: profileMap.get(row.author_id) ?? {
      id: row.author_id,
      username: 'unknown',
      displayName: 'Unknown member',
      city: 'Daegu',
    },
  }));
}
