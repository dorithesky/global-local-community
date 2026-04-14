export type Category = 'housing' | 'jobs' | 'visa' | 'healthcare' | 'banking' | 'phone-internet' | 'transport' | 'documents' | 'daily-life' | 'events' | 'meetups' | 'local-tips' | 'marketplace';

export type AiLabel = Category | 'spam-risk' | 'safe';

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  city: string;
  originCountry?: string;
  occupation?: string;
  avatarUrl?: string;
  createdAt?: string;
  onboardingCompleted?: boolean;
  badges?: Array<'admin' | 'moderator'>;
  publicCommentCount?: number;
  profileVisibility?: 'public' | 'member';
}

export interface AiAnalysis {
  score: number;
  label: AiLabel;
  explanation: string;
}

export interface PostRecord {
  id: string;
  author: Profile;
  category: Category;
  title: string;
  body: string;
  city: string;
  district?: string;
  tags: string[];
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  bookmarked?: boolean;
  liked?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  imageUrls?: string[];
  analysis: AiAnalysis;
  rank?: number;
}

export interface CommentRecord {
  id: string;
  postId: string;
  author: Profile;
  body: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  deletedBy?: Profile;
  canEdit?: boolean;
  canDelete?: boolean;
  parentCommentId?: string;
  rootCommentId?: string;
  depth?: number;
  replyCount?: number;
  replies?: CommentRecord[];
  replyTarget?: Profile;
}

export interface CommentEventRecord {
  id: string;
  commentId: string;
  actor?: Profile;
  eventType: 'created' | 'edited' | 'deleted';
  oldBody?: string;
  newBody?: string;
  createdAt: string;
}

export interface SecurityAlertRecord {
  id: string;
  ruleName: string;
  severity: 'medium' | 'high' | 'critical';
  summary: string;
  status: string;
  createdAt: string;
  payload?: Record<string, unknown>;
}

export interface PaginatedPostList {
  items: PostRecord[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PostDetailDebug {
  postId: string;
  source: 'live' | 'mock' | 'missing';
  liveCommentCount: number;
  renderedCommentCount: number;
  rawRowCount?: number;
  relatedCommentPostIds?: string[];
}
