import { canRoleDeleteAuthorContent, getCurrentMember } from './auth';
import { sanitizePlainText } from './security';
import { getSupabaseServerClient } from './supabase-server';
import { getCommentsByPostId } from './mock-data';
import type { CommentEventRecord, CommentRecord, PaginatedPostList, PostDetailDebug, PostRecord, Profile } from './types';

function cleanLegacyProfileText(value?: unknown) {
  if (!value) return undefined;
  const text = String(value);
  if (text.startsWith('notifications:') || text.startsWith('consent:')) return undefined;
  return text;
}

function normalizeProfile(
  row: Record<string, unknown>,
  badges?: Array<'admin' | 'moderator'>,
  options?: { viewerIsMember?: boolean; publicCommentCount?: number },
): Profile {
  const viewerIsMember = options?.viewerIsMember ?? false;
  return {
    id: String(row.id),
    username: String(row.username ?? ''),
    displayName: String(row.display_name ?? ''),
    bio: viewerIsMember ? cleanLegacyProfileText(row.bio) : undefined,
    city: String(row.city ?? 'Daegu'),
    originCountry: viewerIsMember && row.origin_country ? String(row.origin_country) : undefined,
    occupation: viewerIsMember ? cleanLegacyProfileText(row.occupation) : undefined,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    onboardingCompleted: typeof row.onboarding_completed === 'boolean' ? row.onboarding_completed : undefined,
    badges: badges ?? [],
    publicCommentCount: options?.publicCommentCount,
    profileVisibility: viewerIsMember ? 'member' : 'public',
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
    imageUrls: Array.isArray(row.image_urls) ? row.image_urls.map(String) : [],
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

const POST_SELECT = 'id, author_id, category, title, body, city, district, tags, image_urls, ai_label, ai_score, ai_explanation, created_at, moderation_status';
const PROFILE_SELECT = 'id, username, display_name, bio, city, origin_country, occupation, avatar_url, created_at, onboarding_completed';

function applyFeedSort(posts: PostRecord[], filters?: { query?: string | null; sort?: string | null }) {
  const sort = filters?.sort ?? 'recent';
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

async function getCommentsSchemaFlags() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return {
      hasDeletedAt: false,
      hasDeletedBy: false,
      hasUpdatedAt: true,
    };
  }

  const checks = await Promise.all([
    supabase.from('comments').select('deleted_at').limit(1),
    supabase.from('comments').select('deleted_by').limit(1),
    supabase.from('comments').select('updated_at').limit(1),
  ]);

  return {
    hasDeletedAt: !checks[0].error,
    hasDeletedBy: !checks[1].error,
    hasUpdatedAt: !checks[2].error,
  };
}

function buildCommentSelect(flags: { hasDeletedAt: boolean; hasDeletedBy: boolean; hasUpdatedAt: boolean }) {
  const fields = ['id', 'post_id', 'body', 'created_at', 'author_id'];
  if (flags.hasUpdatedAt) fields.push('updated_at');
  if (flags.hasDeletedAt) fields.push('deleted_at');
  if (flags.hasDeletedBy) fields.push('deleted_by');
  fields.push('parent_comment_id', 'root_comment_id', 'depth', 'reply_count');
  return fields.join(', ');
}

function normalizeCommentRow(
  row: Record<string, unknown>,
  author: Profile,
  options?: { memberId?: string | null; memberRoles?: string[] },
): CommentRecord {
  const deletedAt = row.deleted_at ? String(row.deleted_at) : undefined;
  const authorId = String(row.author_id);
  const isOwner = Boolean(!deletedAt && options?.memberId && options.memberId === authorId);
  const canDelete = Boolean(!deletedAt && (isOwner || canRoleDeleteAuthorContent(options?.memberRoles, author.badges)));

  return {
    id: String(row.id),
    postId: String(row.post_id),
    body: deletedAt ? `Comment deleted by @${author.username}` : String(row.body ?? ''),
    createdAt: String(row.created_at),
    updatedAt: row.updated_at ? String(row.updated_at) : String(row.created_at),
    deletedAt,
    canEdit: isOwner,
    canDelete,
    author,
    parentCommentId: row.parent_comment_id ? String(row.parent_comment_id) : undefined,
    rootCommentId: row.root_comment_id ? String(row.root_comment_id) : undefined,
    depth: typeof row.depth === 'number' ? row.depth : Number(row.depth ?? 0),
    replyCount: typeof row.reply_count === 'number' ? row.reply_count : Number(row.reply_count ?? 0),
    replies: [],
  };
}

async function enrichPosts(rows: Array<Record<string, unknown>>, options?: { memberId?: string | null; memberRoles?: string[]; viewerIsMember?: boolean }) {
  const supabase = await getSupabaseServerClient();
  if (!supabase || !rows.length) return [];

  const authorIds = [...new Set(rows.map((row) => String(row.author_id)).filter(Boolean))];
  const postIds = rows.map((row) => String(row.id));
  const [{ data: profilesData }, roleBadgeMap, { data: likesData }, { data: commentsData }, { data: bookmarksData }] = await Promise.all([
    supabase.from('profiles').select(PROFILE_SELECT).in('id', authorIds),
    getRoleBadgeMap(authorIds),
    supabase.from('likes').select('post_id, user_id').in('post_id', postIds),
    supabase.from('comments').select('post_id, id').in('post_id', postIds),
    options?.memberId ? supabase.from('bookmarks').select('post_id').eq('user_id', options.memberId).in('post_id', postIds) : Promise.resolve({ data: [] }),
  ]);

  const profileMap = new Map((profilesData ?? []).map((row) => [row.id, normalizeProfile(row, roleBadgeMap.get(String(row.id)), { viewerIsMember: options?.viewerIsMember })]));
  const likeCounts = new Map<string, number>();
  const likedPostIds = new Set<string>();
  const commentCounts = new Map<string, number>();
  const bookmarkedPostIds = new Set((bookmarksData ?? []).map((row) => row.post_id));

  (likesData ?? []).forEach((row) => {
    likeCounts.set(row.post_id, (likeCounts.get(row.post_id) ?? 0) + 1);
    if (options?.memberId && row.user_id === options.memberId) likedPostIds.add(row.post_id);
  });

  (commentsData ?? []).forEach((row) => {
    commentCounts.set(row.post_id, (commentCounts.get(row.post_id) ?? 0) + 1);
  });

  return rows.map((row) => {
    const author = profileMap.get(String(row.author_id)) ?? {
      id: String(row.author_id),
      username: 'unknown',
      displayName: 'Unknown member',
      city: String(row.city ?? 'Daegu'),
    };

    return {
      ...normalizePost(row, author),
      likesCount: likeCounts.get(String(row.id)) ?? 0,
      commentsCount: commentCounts.get(String(row.id)) ?? 0,
      bookmarked: bookmarkedPostIds.has(String(row.id)),
      liked: likedPostIds.has(String(row.id)),
      canEdit: options?.memberId === row.author_id,
      canDelete: options?.memberId === row.author_id || canRoleDeleteAuthorContent(options?.memberRoles, author.badges),
    };
  });
}

async function getRoleBadgeMap(userIds: string[]) {
  const supabase = await getSupabaseServerClient();
  if (!supabase || !userIds.length) return new Map<string, Array<'admin' | 'moderator'>>();

  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', userIds);

  if (error || !data?.length) return new Map<string, Array<'admin' | 'moderator'>>();

  const roleMap = new Map<string, Array<'admin' | 'moderator'>>();
  for (const row of data) {
    if (row.role !== 'admin' && row.role !== 'moderator') continue;
    const existing = roleMap.get(String(row.user_id)) ?? [];
    if (!existing.includes(row.role)) existing.push(row.role);
    roleMap.set(String(row.user_id), existing);
  }

  return roleMap;
}

export async function getFeedPosts(filters?: { city?: string | null; category?: string | null; query?: string | null; sort?: string | null; limit?: number; page?: number }): Promise<PostRecord[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const member = await getCurrentMember();
  let queryBuilder = supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('moderation_status', 'published')
    .order('created_at', { ascending: false })
    .range(((filters?.page ?? 1) - 1) * (filters?.limit ?? 200), (((filters?.page ?? 1) - 1) * (filters?.limit ?? 200)) + (filters?.limit ?? 200) - 1);

  if (filters?.city && filters.city !== 'all') queryBuilder = queryBuilder.eq('city', filters.city);
  if (filters?.category && filters.category !== 'all') queryBuilder = queryBuilder.eq('category', filters.category);
  const safeQuery = sanitizePlainText(filters?.query, { maxLength: 80, allowNewlines: false }).replace(/[%,]/g, ' ').trim();
  if (safeQuery) queryBuilder = queryBuilder.or(`title.ilike.%${safeQuery}%,body.ilike.%${safeQuery}%`);

  const { data, error } = await queryBuilder;

  if (error || !data?.length) return [];

  const normalized = await enrichPosts(data as Array<Record<string, unknown>>, {
    memberId: member?.id ?? null,
    memberRoles: member?.roles,
    viewerIsMember: Boolean(member),
  });

  return applyFeedSort(normalized, filters);
}

function scoreTrendingPost(post: PostRecord) {
  return (post.likesCount * 2) + (post.commentsCount * 3) + (new Date(post.createdAt).getTime() / 1000 / 60 / 60 / 24) * 0.01;
}

export async function getTrendingPosts(limit = 5): Promise<PostRecord[]> {
  const posts = await getFeedPosts({ sort: 'recent', limit: 200, page: 1 });

  return [...posts]
    .sort((a, b) => scoreTrendingPost(b) - scoreTrendingPost(a))
    .slice(0, limit);
}

export async function getTrendingPostsByCategory(category: string, limit = 2): Promise<PostRecord[]> {
  const posts = await getFeedPosts({ sort: 'recent', category, limit: 100, page: 1 });

  return [...posts]
    .sort((a, b) => scoreTrendingPost(b) - scoreTrendingPost(a))
    .slice(0, limit);
}

export async function getPaginatedFeedPosts(filters?: { city?: string | null; category?: string | null; query?: string | null; sort?: string | null; limit?: number; page?: number }): Promise<PaginatedPostList> {
  const page = Math.max(filters?.page ?? 1, 1);
  const pageSize = Math.max(filters?.limit ?? 10, 1);
  const items = await getFeedPosts({ ...filters, limit: pageSize, page });
  const hasMore = items.length === pageSize;

  return {
    items,
    total: hasMore ? page * pageSize + 1 : ((page - 1) * pageSize) + items.length,
    page,
    pageSize,
    hasMore,
  };
}

export async function getPost(id: string): Promise<PostRecord | undefined> {
  const supabase = await getSupabaseServerClient();
  const member = await getCurrentMember();

  if (supabase) {
    const { data: row, error } = await supabase
      .from('posts')
      .select('id, author_id, category, title, body, city, district, tags, image_urls, ai_label, ai_score, ai_explanation, created_at, moderation_status')
      .eq('id', id)
      .eq('moderation_status', 'published')
      .maybeSingle();

    if (row && !error) {
      const [{ data: profileRow }, { data: likesData }, { data: bookmarksData }, roleBadgeMap] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, display_name, bio, city, origin_country, occupation, avatar_url, created_at, onboarding_completed')
          .eq('id', row.author_id)
          .maybeSingle(),
        supabase.from('likes').select('user_id').eq('post_id', id),
        member ? supabase.from('bookmarks').select('post_id').eq('user_id', member.id).eq('post_id', id) : Promise.resolve({ data: [] }),
        getRoleBadgeMap([String(row.author_id)]),
      ]);

      const author = profileRow ? normalizeProfile(profileRow, roleBadgeMap.get(String(row.author_id))) : {
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
        canDelete: Boolean(member?.id === row.author_id || canRoleDeleteAuthorContent(member?.roles, author.badges)),
      };
    }
  }

  return undefined;
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

  if (post.id.startsWith('post-')) {
    const comments = getCommentsByPostId(id);
    const topLevelComments = comments.filter((comment) => (comment.depth ?? 0) === 0);
    return {
      post: {
        ...post,
        commentsCount: comments.length,
      },
      comments: topLevelComments,
      debug: {
        postId: id,
        source: 'mock',
        liveCommentCount: comments.length,
        renderedCommentCount: topLevelComments.length,
      },
    };
  }

  const supabase = await getSupabaseServerClient();
  const member = await getCurrentMember();

  if (!supabase) {
    return {
      post: {
        ...post,
        commentsCount: 0,
      },
      comments: [],
      debug: {
        postId: id,
        source: 'live',
        liveCommentCount: 0,
        renderedCommentCount: 0,
        relatedCommentPostIds: [],
      },
    };
  }

  const flags = await getCommentsSchemaFlags();
  const commentSelect = buildCommentSelect(flags);

  const [{ count }, { data: rows, error }, { data: memberCommentRows }] = await Promise.all([
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', id),
    supabase
      .from('comments')
      .select(commentSelect)
      .eq('post_id', id)
      .order('created_at', { ascending: true }),
    member ? supabase.from('comments').select('post_id').eq('author_id', member.id).order('created_at', { ascending: false }).limit(10) : Promise.resolve({ data: [] }),
  ]);

  if (error || !rows?.length) {
    const fallbackComments: CommentRecord[] = member
      ? (await getUserComments()).filter((comment) => comment.postId === id)
      : [];

    return {
      post: {
        ...post,
        commentsCount: count ?? fallbackComments.length,
      },
      comments: fallbackComments,
      debug: {
        postId: id,
        source: 'live',
        liveCommentCount: count ?? 0,
        renderedCommentCount: fallbackComments.length,
        rawRowCount: rows?.length ?? 0,
        relatedCommentPostIds: (memberCommentRows ?? []).map((row) => row.post_id),
      },
    };
  }

  const commentRows = rows as unknown as Array<Record<string, unknown>>;
  const authorIds = [...new Set(commentRows.map((row) => row.author_id).filter(Boolean))];
  const [{ data: profilesData }, roleBadgeMap] = authorIds.length
    ? await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, display_name, bio, city, origin_country, occupation, avatar_url')
          .in('id', authorIds),
        getRoleBadgeMap(authorIds.map(String)),
      ])
    : [{ data: [] }, new Map<string, Array<'admin' | 'moderator'>>()];

  const profileMap = new Map((profilesData ?? []).map((row) => [row.id, normalizeProfile(row, roleBadgeMap.get(String(row.id)))]));

  const comments = commentRows.map((row) => {
    const author = profileMap.get(row.author_id) ?? {
      id: String(row.author_id),
      username: `member-${String(row.author_id).slice(0, 6)}`,
      displayName: 'Member',
      city: 'Daegu',
    };

    return normalizeCommentRow(row, author, { memberId: member?.id ?? null, memberRoles: member?.roles });
  });

  const safeComments = comments.filter((comment) => Boolean(comment.id && comment.postId));
  const topLevelComments = safeComments.filter((comment) => (comment.depth ?? 0) === 0);
  const replyMap = new Map<string, CommentRecord[]>();

  safeComments
    .filter((comment) => (comment.depth ?? 0) === 1 && comment.parentCommentId)
    .forEach((comment) => {
      const key = comment.parentCommentId as string;
      const existingReplies = replyMap.get(key) ?? [];
      existingReplies.push(comment);
      replyMap.set(key, existingReplies);
    });

  const threadedComments = topLevelComments.map((comment) => {
    const replies = replyMap.get(comment.id) ?? [];
    return {
      ...comment,
      replies: replies.map((reply) => ({
        ...reply,
        replyTarget: comment.author,
      })),
      replyCount: replies.length,
    };
  });

  return {
    post: {
      ...post,
      commentsCount: count ?? safeComments.length,
    },
    comments: threadedComments,
    debug: {
      postId: id,
      source: 'live',
      liveCommentCount: count ?? safeComments.length,
      renderedCommentCount: threadedComments.length,
      rawRowCount: commentRows.length,
      relatedCommentPostIds: (memberCommentRows ?? []).map((row) => row.post_id),
    },
  };
}

export async function getCategoryPosts(category: string | string[], options?: { page?: number; limit?: number }): Promise<PaginatedPostList> {
  const categoryList = Array.isArray(category) ? category : [category];

  if (categoryList.length === 1) {
    return getPaginatedFeedPosts({ category: categoryList[0], sort: 'recent', page: options?.page ?? 1, limit: options?.limit ?? 10 });
  }

  const page = Math.max(options?.page ?? 1, 1);
  const pageSize = Math.max(options?.limit ?? 10, 1);
  const supabase = await getSupabaseServerClient();
  const member = await getCurrentMember();

  if (!supabase) {
    const fallback = (await getFeedPosts({ sort: 'recent', limit: 200, page: 1 })).filter((post) => categoryList.includes(post.category));
    const items = fallback.slice((page - 1) * pageSize, page * pageSize);
    return { items, total: fallback.length, page, pageSize, hasMore: page * pageSize < fallback.length };
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await supabase
    .from('posts')
    .select(POST_SELECT, { count: 'exact' })
    .in('category', categoryList)
    .eq('moderation_status', 'published')
    .order('created_at', { ascending: false })
    .range(from, to);

  const items = await enrichPosts((data ?? []) as Array<Record<string, unknown>>, {
    memberId: member?.id ?? null,
    memberRoles: member?.roles,
    viewerIsMember: Boolean(member),
  });

  return {
    items,
    total: count ?? items.length,
    page,
    pageSize,
    hasMore: to + 1 < (count ?? 0),
  };
}

export async function getProfile(username: string): Promise<Profile | undefined> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return undefined;

  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, city, origin_country, occupation, avatar_url, created_at, onboarding_completed')
    .eq('username', username)
    .maybeSingle();

  if (!data) return undefined;
  const member = await getCurrentMember();
  const roleBadgeMap = await getRoleBadgeMap([String(data.id)]);
  const { count: publicCommentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', data.id);

  return normalizeProfile(data, roleBadgeMap.get(String(data.id)), {
    viewerIsMember: Boolean(member),
    publicCommentCount: publicCommentCount ?? 0,
  });
}

export async function getProfilePosts(username: string, options?: { page?: number; limit?: number }): Promise<PaginatedPostList> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { items: [], total: 0, page: options?.page ?? 1, pageSize: options?.limit ?? 10, hasMore: false };

  const member = await getCurrentMember();
  const { data: profileRow } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle();
  if (!profileRow) return { items: [], total: 0, page: options?.page ?? 1, pageSize: options?.limit ?? 10, hasMore: false };

  const page = Math.max(options?.page ?? 1, 1);
  const pageSize = Math.max(options?.limit ?? 10, 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count } = await supabase
    .from('posts')
    .select(POST_SELECT, { count: 'exact' })
    .eq('author_id', profileRow.id)
    .eq('moderation_status', 'published')
    .order('created_at', { ascending: false })
    .range(from, to);

  const items = await enrichPosts((data ?? []) as Array<Record<string, unknown>>, {
    memberId: member?.id ?? null,
    memberRoles: member?.roles,
    viewerIsMember: Boolean(member),
  });

  return {
    items,
    total: count ?? items.length,
    page,
    pageSize,
    hasMore: to + 1 < (count ?? 0),
  };
}

export async function getPostComments(postId: string): Promise<CommentRecord[]> {
  const supabase = await getSupabaseServerClient();
  const member = await getCurrentMember();

  if (!supabase) {
    return getCommentsByPostId(postId).map((comment) => ({
      ...comment,
      canEdit: member ? comment.author.id === member.id || comment.author.username === member.username : false,
      canDelete: member ? comment.author.id === member.id || canRoleDeleteAuthorContent(member.roles, comment.author.badges) : false,
    }));
  }

  const flags = await getCommentsSchemaFlags();
  const { data, error } = await supabase
    .from('comments')
    .select(buildCommentSelect(flags))
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error || !data?.length) {
    return [];
  }

  const commentRows = data as unknown as Array<Record<string, unknown>>;
  const authorIds = [...new Set(commentRows.map((row) => row.author_id).filter(Boolean))];
  const { data: profilesData } = authorIds.length
    ? await supabase
        .from('profiles')
        .select('id, username, display_name, bio, city, origin_country, occupation, avatar_url')
        .in('id', authorIds)
    : { data: [] };

  const profileMap = new Map((profilesData ?? []).map((row) => [row.id, normalizeProfile(row)]));

  return commentRows.map((row) => {
    const author = profileMap.get(row.author_id) ?? {
      id: String(row.author_id),
      username: `member-${String(row.author_id).slice(0, 6)}`,
      displayName: 'Member',
      city: 'Daegu',
    };

    return normalizeCommentRow(row, author, { memberId: member?.id ?? null, memberRoles: member?.roles });
  });
}

export async function getSavedPosts(options?: { page?: number; limit?: number }): Promise<PaginatedPostList> {
  const member = await getCurrentMember();
  if (!member) return { items: [], total: 0, page: options?.page ?? 1, pageSize: options?.limit ?? 10, hasMore: false };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { items: [], total: 0, page: options?.page ?? 1, pageSize: options?.limit ?? 10, hasMore: false };

  const page = Math.max(options?.page ?? 1, 1);
  const pageSize = Math.max(options?.limit ?? 10, 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: bookmarkRows, count } = await supabase
    .from('bookmarks')
    .select('post_id', { count: 'exact' })
    .eq('user_id', member.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  const postIds = (bookmarkRows ?? []).map((row) => row.post_id);
  if (!postIds.length) return { items: [], total: count ?? 0, page, pageSize, hasMore: false };

  const { data: postRows } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .in('id', postIds)
    .eq('moderation_status', 'published');

  const items = await enrichPosts((postRows ?? []) as Array<Record<string, unknown>>, {
    memberId: member.id,
    memberRoles: member.roles,
    viewerIsMember: true,
  });
  const order = new Map(postIds.map((id, index) => [id, index]));
  items.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  return {
    items,
    total: count ?? items.length,
    page,
    pageSize,
    hasMore: to + 1 < (count ?? 0),
  };
}

export async function getUserLikedPosts(options?: { page?: number; limit?: number }): Promise<PaginatedPostList> {
  const member = await getCurrentMember();
  if (!member) return { items: [], total: 0, page: options?.page ?? 1, pageSize: options?.limit ?? 10, hasMore: false };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { items: [], total: 0, page: options?.page ?? 1, pageSize: options?.limit ?? 10, hasMore: false };

  const page = Math.max(options?.page ?? 1, 1);
  const pageSize = Math.max(options?.limit ?? 10, 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: likeRows, count } = await supabase
    .from('likes')
    .select('post_id', { count: 'exact' })
    .eq('user_id', member.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  const postIds = (likeRows ?? []).map((row) => row.post_id);
  if (!postIds.length) return { items: [], total: count ?? 0, page, pageSize, hasMore: false };

  const { data: postRows } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .in('id', postIds)
    .eq('moderation_status', 'published');

  const items = await enrichPosts((postRows ?? []) as Array<Record<string, unknown>>, {
    memberId: member.id,
    memberRoles: member.roles,
    viewerIsMember: true,
  });
  const order = new Map(postIds.map((id, index) => [id, index]));
  items.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  return {
    items,
    total: count ?? items.length,
    page,
    pageSize,
    hasMore: to + 1 < (count ?? 0),
  };
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

export async function getUserComments(): Promise<CommentRecord[]> {
  const member = await getCurrentMember();
  if (!member) return [];

  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const flags = await getCommentsSchemaFlags();
  const { data, error } = await supabase
    .from('comments')
    .select(buildCommentSelect(flags))
    .eq('author_id', member.id)
    .order('created_at', { ascending: false });

  if (error || !data?.length) return [];

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, city, origin_country, occupation, avatar_url')
    .eq('id', member.id)
    .maybeSingle();

  const author: Profile = profileRow
    ? normalizeProfile(profileRow)
    : {
        id: member.id,
        username: member.username,
        displayName: member.displayName,
        city: process.env.NEXT_PUBLIC_CITY ?? 'Daegu',
        avatarUrl: member.avatarUrl,
      };

  const commentRows = data as unknown as Array<Record<string, unknown>>;
  return commentRows.map((row) => normalizeCommentRow(row, author, { memberId: member.id, memberRoles: member.roles }));
}

export async function canCurrentMemberManageComment(commentId: string) {
  const member = await getCurrentMember();
  if (!member) return false;

  const supabase = await getSupabaseServerClient();
  if (!supabase) return false;

  const { data: commentRow } = await supabase
    .from('comments')
    .select('id, author_id')
    .eq('id', commentId)
    .maybeSingle();

  if (!commentRow) return false;
  if (commentRow.author_id === member.id) return true;

  const { data: targetRoleRows } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', commentRow.author_id);

  const targetRoles = (targetRoleRows ?? []).map((row) => row.role);
  return canRoleDeleteAuthorContent(member.roles, targetRoles);
}

export async function getUserCommentedPosts(options?: { page?: number; limit?: number }): Promise<PaginatedPostList> {
  const member = await getCurrentMember();
  if (!member) return { items: [], total: 0, page: options?.page ?? 1, pageSize: options?.limit ?? 10, hasMore: false };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { items: [], total: 0, page: options?.page ?? 1, pageSize: options?.limit ?? 10, hasMore: false };

  const allComments = await supabase
    .from('comments')
    .select('post_id, created_at')
    .eq('author_id', member.id)
    .order('created_at', { ascending: false });

  const uniquePostIds = [...new Set((allComments.data ?? []).map((row) => row.post_id))];
  const page = Math.max(options?.page ?? 1, 1);
  const pageSize = Math.max(options?.limit ?? 10, 1);
  const slicedIds = uniquePostIds.slice((page - 1) * pageSize, page * pageSize);
  if (!slicedIds.length) return { items: [], total: uniquePostIds.length, page, pageSize, hasMore: false };

  const { data: postRows } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .in('id', slicedIds)
    .eq('moderation_status', 'published');

  const items = await enrichPosts((postRows ?? []) as Array<Record<string, unknown>>, {
    memberId: member.id,
    memberRoles: member.roles,
    viewerIsMember: true,
  });
  const order = new Map(slicedIds.map((id, index) => [id, index]));
  items.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  return {
    items,
    total: uniquePostIds.length,
    page,
    pageSize,
    hasMore: page * pageSize < uniquePostIds.length,
  };
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
      recentPosts: [],
      commentHistory: [],
    };
  }

  const [{ data: reportsData }, recentPosts] = await Promise.all([
    supabase
      .from('reports')
      .select('id, reason, details, status, created_at, reporter_id, post_id, comment_id')
      .order('created_at', { ascending: false })
      .limit(20),
    getFeedPosts(),
  ]);

  const postIds = (reportsData ?? []).map((report) => report.post_id).filter(Boolean);
  const commentIds = (reportsData ?? []).map((report) => report.comment_id).filter(Boolean);
  const flags = await getCommentsSchemaFlags();
  const [reportedPosts, reportedComments] = await Promise.all([
    postIds.length
      ? supabase
          .from('posts')
          .select('id, author_id, category, title, body, city, district, tags, ai_label, ai_score, ai_explanation, created_at')
          .in('id', postIds)
      : Promise.resolve({ data: [] }),
    commentIds.length
      ? supabase
          .from('comments')
          .select(buildCommentSelect(flags))
          .in('id', commentIds)
      : Promise.resolve({ data: [] }),
  ]);

  const reportedPostRows = (reportedPosts.data ?? []) as unknown as Array<Record<string, unknown>>;
  const reportedCommentRows = (reportedComments.data ?? []) as unknown as Array<Record<string, unknown>>;
  const reportedPostMap = new Map(reportedPostRows.map((post) => [String(post.id), post]));
  const reportedCommentMap = new Map(reportedCommentRows.map((comment) => [String(comment.id), comment]));

  const commentHistory = await getCommentHistoryForAdmin();

  return {
    reports: (reportsData ?? []).map((report) => ({
      ...report,
      post: report.post_id ? reportedPostMap.get(report.post_id) ?? null : null,
      comment: report.comment_id ? reportedCommentMap.get(report.comment_id) ?? null : null,
    })),
    recentPosts: recentPosts.slice(0, 8),
    commentHistory,
  };
}
