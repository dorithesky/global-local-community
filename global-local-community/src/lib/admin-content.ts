import { sanitizePlainText, sanitizeTagList } from '@/lib/security';
import type { Category } from '@/lib/types';

export const ADMIN_CONTENT_ALLOWED_CATEGORIES: Category[] = [
  'housing',
  'jobs',
  'visa',
  'healthcare',
  'banking',
  'phone-internet',
  'transport',
  'documents',
  'daily-life',
  'events',
  'meetups',
  'local-tips',
  'marketplace',
];

export function sanitizeAdminContentInput(input: {
  authorId: string;
  city: unknown;
  district?: unknown;
  category: unknown;
  title: unknown;
  body: unknown;
  tags?: unknown;
}) {
  const authorId = String(input.authorId ?? '').trim();
  const city = sanitizePlainText(input.city, { maxLength: 40, allowNewlines: false }) || 'Seoul';
  const district = sanitizePlainText(input.district, { maxLength: 80, allowNewlines: false });
  const category = sanitizePlainText(input.category, { maxLength: 40, allowNewlines: false }) as Category;
  const title = sanitizePlainText(input.title, { maxLength: 140, allowNewlines: false });
  const body = sanitizePlainText(input.body, { maxLength: 5000, allowNewlines: true });
  const tags = sanitizeTagList(input.tags);

  if (!authorId) throw new Error('Author is required.');
  if (!ADMIN_CONTENT_ALLOWED_CATEGORIES.includes(category)) throw new Error('Category is invalid.');
  if (!title || !body) throw new Error('Title and body are required.');

  return {
    authorId,
    city,
    district: district || null,
    category,
    title,
    body,
    tags,
  };
}
