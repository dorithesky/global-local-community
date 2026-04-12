import { getCurrentMember } from './auth';
import { getSupabaseServerClient } from './supabase-server';
import { getSupabaseAdminClient } from './supabase-admin';
import { getCommentsByPostId, getPostById, getPostsByCategory, getProfileByUsername, posts as mockPosts } from './mock-data';
import type { CommentEventRecord, CommentRecord, PostDetailDebug, PostRecord, Profile } from './types';

function cleanLegacyProfileText(value?: unknown) {
  if (!value) return undefined;
  const text = String(value);
  if (text.startsWith('notifications:') || text.startsWith('consent:')) return undefined;
  return text;
}

function normalizeProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    username: String(row.username ?? ''),
    displayName: String(row.display_name ?? ''),
    bio: cleanLegacyProfileText(row.bio),
    city: String(row.city ?? 'Daegu'),
    originCountry: row.origin_country ? String(row.origin_country) : undefined,
    occupation: cleanLegacyProfileText(row.occupation),
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

function applyFeedSort(posts: PostRecord[], filters?: { query?: string | null; sort?: string | null }) {
  const sort = filters?.sort ?? 'relevance';
  const query = (filters?.query ?? '').trim().toLowerCase();

  if (sort === 'oldest') {
    return [...posts].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  if (sort === 'recent') {
    return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  if (!query) {
    return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const score = (post: PostRecord) => {
    const haystack = `${post.title} ${post.body} ${post.tags.join(' ')}`.toLowerCase();
    let points = 0;
    if (post.title.toLowerCase().includes(query)) points += 8;
    if (post.body.toLowerCase().includes(query)) points += 4;
    if (post.tags.some((tag) => tag.includes(query))) points += 3;
    if (haystack.includes(query)) points += 2;
    points += post.commentsCount * 0.05;
    points += post.likesCount * 0.03;
    return points;
  };

  return [...posts].sort((a, b) => score(b) - score(a) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getFeedPosts(filters?: { city?: string | null; category?: string | null; query?: string | null; sort?: string | null }): Promise<PostRecord[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return mockPosts;

  const member = await getCurrentMember();
  let queryBuilder = supabase
    .from('posts')
    .select('id, author_id, category, title, body, city, district, tags, ai_label, ai_score, ai_explanation, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (filters?.city && filters.city !== 'all') queryBuilder = queryBuilder.eq('city', filters.city);
  if (filters?.category && filters.category !== 'all') queryBuilder = queryBuilder.eq('category', filters.category);
  if (filters?.query) queryBuilder = queryBuilder.or(`title.ilike.%${filters.query}%,body.ilike.%${filters.query}%`);

  const { data, error } = await queryBuilder;

  if (error || !data?.length) return applyFeedSort(mockPosts, filters);

  const authorIds = [...new Set(data.map((row) => row.author_id))];
  const postIds = data.map((row) => row.id);
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, city, origin_country, occupation, avatar_url')
    .in('id', authorIds);

  const [{ data: likesData }, { data: commentsData }, { data: bookmarksData }] = await Promise.all([
    supabase.from('likes').select('post_id, user_id').in('post_id', postIds),
    supabase.from('comments').select('post_id, id').in('post_id', postIds),
    member ? supabase.from('bookmarks').select('post_id').eq('user_id', member.id).in('post_id', postIds) : Promise.resolve({ data: [] }),
  ]);

  const profileMap = new Map((profilesData ?? []).map((row) => [row.id, normalizeProfile(row)]));
  const likeCounts = new Map<string, number>();
  const likedPostIds = new Set<string>();
  const commentCounts = new Map<string, number>();
  const bookmarkedPostIds = new Set((bookmarksData ?? []).map((row) => row.post_id));

  (likesData ?? []).forEach((row) => {
    likeCounts.set(row.post_id, (likeCounts.get(row.post_id) ?? 0) + 1);
    if (member && row.user_id === member.id) likedPostIds.add(row.post_id);
  });

  (commentsData ?? []).forEach((row) => {
    commentCounts.set(row.post_id, (commentCounts.get(row.post_id) ?? 0) + 1);
  });

  const normalized = data.map((row) => ({
    ...normalizePost(row, profileMap.get(row.author_id) ?? {
      id: String(row.author_id),
      username: 'unknown',
      displayName: 'Unknown member',
      city: String(row.city ?? 'Daegu'),
    }),
    likesCount: likeCounts.get(row.id) ?? 0,
    commentsCount: commentCounts.get(row.id) ?? 0,
    bookmarked: bookmarkedPostIds.has(row.id),
    liked: likedPostIds.has(row.id),
    canEdit: member?.id === row.author_id,
  }));

  return applyFeedSort(normalized, filters);
}

export async function getPost(id: string): Promise<PostRecord | undefined> {
  const supabase = await getSupabaseServerClient();
  const member = await getCurrentMember();

  if (supabase) {
    const { data: row, error } = await supabase
      .from('posts')
      .select('id, author_id, category, title, body, city, district, tags, ai_label, ai_score, ai_explanation, created_at')
      .eq('id', id)
      .maybeSingle();

    if (row && !error) {
      const [{ data: profileRow }, { data: likesData }, { data: bookmarksData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, display_name, bio, city, origin_country, occupation, avatar_url')
          .eq('id', row.author_id)
          .maybeSingle(),
        supabase.from('likes').select('user_id').eq('post_id', id),
        member ? supabase.from('bookmarks').select('post_id').eq('user_id', member.id).eq('post_id', id) : Promise.resolve({ data: [] }),
      ]);

      const author = profileRow ? normalizeProfile(profileRow) : {
        id: String(row.author_id),
        username: 'unknown',
        displayName: 'Unknown member',
        city: String(row.city ?? 'Daegu'),
      };

      return {
        ...normalizePost(row, author),
        likesCount: likesData?.length ?? 0,
        commentsCount: 0,
        bookmarked: Boolean(bookmarksData?.length),
        liked: Boolean(member && likesData?.some((like) => like.user_id === member.id)),
        canEdit: Boolean(member?.id === row.author_id),
      };
    }
  }

  return getPostById(id);
}

export async function getPostDetail(id: string): Promise<{ post?: PostRecord; comments: CommentRecord[]; debug: PostDetailDebug }> {
  const post = await getPost(id);

  if (!post) {
    return {
      post: undefined,
      comments: [],
      debug: {
        postId: id,
        source: 'missing',
        liveCommentCount: 0,
        renderedCommentCount: 0,
      },
    };
  }

  let comments = await getPostComments(id);
  const detailSource: PostDetailDebug['source'] = post.id.startsWith('post-') ? 'mock' : 'live';

  if (!comments.length && detailSource === 'live') {
    const admin = getSupabaseAdminClient();
    if (admin) {
      const { data: rawComments } = await admin
        .from('comments')
        .select('id, post_id, body, created_at, updated_at, deleted_at, deleted_by, author_id')
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (rawComments?.length) {
        const authorIds = [...new Set(rawComments.map((row) => row.author_id).filter(Boolean))];
        const deletedByIds = [...new Set(rawComments.map((row) => row.deleted_by).filter(Boolean))];
        const profileIds = [...new Set([...authorIds, ...deletedByIds])];
        const { data: profiles } = profileIds.length
          ? await admin
              .from('profiles')
              .select('id, username, display_name, bio, city, origin_country, occupation, avatar_url')
              .in('id', profileIds)
          : { data: [] };

        const profileMap = new Map((profiles ?? []).map((row) => [row.id, normalizeProfile(row)]));
        const member = await getCurrentMember();

        comments = rawComments.map((row) => {
          const author = profileMap.get(row.author_id) ?? {
            id: row.author_id,
            username: `member-${String(row.author_id).slice(0, 6)}`,
            displayName: 'Member',
            city: 'Daegu',
          };
          const deletedByProfile = row.deleted_by ? profileMap.get(row.deleted_by) : undefined;

          return {
            id: row.id,
            postId: row.post_id,
            body: row.deleted_at ? `Comment deleted by ${deletedByProfile?.username ? `@${deletedByProfile.username}` : 'author'}` : row.body,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at ?? undefined,
            deletedBy: deletedByProfile,
            canEdit: Boolean(!row.deleted_at && member && (member.id === row.author_id || member.username === author.username)),
            author,
          };
        });
      }
    }
  }

  return {
    post: {
      ...post,
      commentsCount: comments.length,
    },
    comments,
    debug: {
      postId: id,
      source: detailSource,
      liveCommentCount: comments.length,
      renderedCommentCount: comments.length,
    },
  };
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
  const member = await getCurrentMember();

  if (!supabase) {
    return getCommentsByPostId(postId).map((comment) => ({
      ...comment,
      canEdit: member ? comment.author.id === member.id || comment.author.username === member.username : false,
    }));
  }

  const { data: postExists } = await supabase
    .from('posts')
    .select('id')
    .eq('id', postId)
    .maybeSingle();

  const { data, error } = await supabase
    .from('comments')
    .select('id, post_id, body, created_at, updated_at, deleted_at, deleted_by, author_id')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    return [];
  }

  if (!data?.length) {
    return postExists
      ? []
      : getCommentsByPostId(postId).map((comment) => ({
          ...comment,
          canEdit: member ? comment.author.id === member.id || comment.author.username === member.username : false,
        }));
  }

  const authorIds = [...new Set(data.map((row) => row.author_id).filter(Boolean))];
  const deletedByIds = [...new Set(data.map((row) => row.deleted_by).filter(Boolean))];

  const [{ data: authorProfiles, error: authorProfilesError }, { data: deletedByProfiles, error: deletedByProfilesError }] = await Promise.all([
    authorIds.length
      ? supabase
          .from('profiles')
          .select('id, username, display_name, bio, city, origin_country, occupation, avatar_url')
          .in('id', authorIds)
      : Promise.resolve({ data: [], error: null }),
    deletedByIds.length
      ? supabase
          .from('profiles')
          .select('id, username, display_name, bio, city, origin_country, occupation, avatar_url')
          .in('id', deletedByIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const canUseProfiles = !authorProfilesError && !deletedByProfilesError;
  const profileMap = new Map(canUseProfiles ? [...(authorProfiles ?? []), ...(deletedByProfiles ?? [])].map((row) => [row.id, normalizeProfile(row)]) : []);

  return data.map((row) => {
    const author = profileMap.get(row.author_id) ?? {
      id: row.author_id,
      username: canUseProfiles ? 'unknown' : `member-${String(row.author_id).slice(0, 6)}`,
      displayName: canUseProfiles ? 'Unknown member' : 'Member',
      city: 'Daegu',
    };

    const deletedByProfile = row.deleted_by ? profileMap.get(row.deleted_by) : undefined;

    return {
      id: row.id,
      postId: row.post_id,
      body: row.deleted_at ? `Comment deleted by ${deletedByProfile?.username ? `@${deletedByProfile.username}` : 'author'}` : row.body,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at ?? undefined,
      deletedBy: deletedByProfile,
      canEdit: Boolean(!row.deleted_at && member && (member.id === row.author_id || member.username === author.username)),
      author,
    };
  });
}

export async function getSavedPosts() {
  const member = await getCurrentMember();
  if (!member) return [];

  const feed = await getFeedPosts();
  return feed.filter((post) => post.bookmarked);
}

export async function getUserLikedPosts() {
  const member = await getCurrentMember();
  if (!member) return [];

  const feed = await getFeedPosts();
  return feed.filter((post) => post.liked);
}

export async function getProfileComments(username: string): Promise<CommentRecord[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const profile = await getProfile(username);
  if (!profile) return [];

  const { data, error } = await supabase
    .from('comments')
    .select('id, post_id, body, created_at, author_id')
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false });

  if (error || !data?.length) return [];

  return data.map((row) => ({
    id: row.id,
    postId: row.post_id,
    body: row.body,
    createdAt: row.created_at,
    author: profile,
  }));
}

export async function getCommentHistoryForAdmin(limit = 100): Promise<CommentEventRecord[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('comment_events')
    .select('id, comment_id, actor_id, event_type, old_body, new_body, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data?.length) return [];

  const actorIds = [...new Set(data.map((row) => row.actor_id).filter(Boolean))];
  const { data: profilesData } = actorIds.length
    ? await supabase
        .from('profiles')
        .select('id, username, display_name, bio, city, origin_country, occupation, avatar_url')
        .in('id', actorIds)
    : { data: [] };

  const profileMap = new Map((profilesData ?? []).map((row) => [row.id, normalizeProfile(row)]));

  return data.map((row) => ({
    id: String(row.id),
    commentId: row.comment_id,
    actor: row.actor_id ? profileMap.get(row.actor_id) : undefined,
    eventType: row.event_type,
    oldBody: row.old_body ?? undefined,
    newBody: row.new_body ?? undefined,
    createdAt: row.created_at,
  }));
}

export async function getUserComments() {
  const member = await getCurrentMember();
  if (!member) return [];

  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('comments')
    .select('id, post_id, body, created_at, updated_at, author_id')
    .eq('author_id', member.id)
    .order('created_at', { ascending: false });

  if (error || !data?.length) return [];

  return data.map((row) => ({
    id: row.id,
    postId: row.post_id,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    canEdit: true,
    author: member,
  }));
}

export async function getUserCommentedPosts() {
  const member = await getCurrentMember();
  if (!member) return [];

  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('comments')
    .select('post_id')
    .eq('author_id', member.id);

  const commentedPostIds = new Set((data ?? []).map((row) => row.post_id));
  const feed = await getFeedPosts();
  return feed.filter((post) => commentedPostIds.has(post.id));
}

export async function getCommentCountByPostId(postId: string): Promise<number> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return getCommentsByPostId(postId).length;

  const { count } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  return count ?? 0;
}

export async function getAdminModerationView() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return {
      reports: [],
      recentPosts: mockPosts.slice(0, 8),
    };
  }

  const [{ data: reportsData }, recentPosts] = await Promise.all([
    supabase
      .from('reports')
      .select('id, reason, details, status, created_at, reporter_id, post_id')
      .order('created_at', { ascending: false })
      .limit(20),
    getFeedPosts(),
  ]);

  const postIds = (reportsData ?? []).map((report) => report.post_id).filter(Boolean);
  const reportedPosts = postIds.length
    ? await supabase
        .from('posts')
        .select('id, author_id, category, title, body, city, district, tags, ai_label, ai_score, ai_explanation, created_at')
        .in('id', postIds)
    : { data: [] };

  const reportedPostMap = new Map((reportedPosts.data ?? []).map((post) => [post.id, post]));

  const commentHistory = await getCommentHistoryForAdmin();

  return {
    reports: (reportsData ?? []).map((report) => ({
      ...report,
      post: report.post_id ? reportedPostMap.get(report.post_id) ?? null : null,
    })),
    recentPosts: recentPosts.slice(0, 8),
    commentHistory,
  };
}
