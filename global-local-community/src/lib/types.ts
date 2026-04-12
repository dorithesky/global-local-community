export type Category = 'housing' | 'jobs' | 'daily-life' | 'events' | 'marketplace';

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
  imageUrls?: string[];
  analysis: AiAnalysis;
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

export interface PostDetailDebug {
  postId: string;
  source: 'live' | 'mock' | 'missing';
  liveCommentCount: number;
  renderedCommentCount: number;
  rawRowCount?: number;
  relatedCommentPostIds?: string[];
}
