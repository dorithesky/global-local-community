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
  analysis: AiAnalysis;
}

export interface CommentRecord {
  id: string;
  postId: string;
  author: Profile;
  body: string;
  createdAt: string;
}
