import { subHours } from 'date-fns';
import type { CommentRecord, PostRecord, Profile } from './types';

const profiles: Profile[] = [
  {
    id: '1',
    username: 'mina-expat',
    displayName: 'Mina Carter',
    bio: 'Community host for newcomers in Daegu.',
    city: 'Daegu',
    originCountry: 'Canada',
    occupation: 'Teacher',
  },
  {
    id: '2',
    username: 'jaynomad',
    displayName: 'Jay Park',
    bio: 'Sharing practical Korea life tips.',
    city: 'Daegu',
    originCountry: 'USA',
    occupation: 'Designer',
  },
  {
    id: '3',
    username: 'sara-abroad',
    displayName: 'Sara Kim',
    bio: 'Helping people find housing and jobs.',
    city: 'Daegu',
    originCountry: 'UK',
    occupation: 'Recruiter',
  },
];

const basePosts = [
  ['housing', 'Need a short-term officetel near Banwoldang', 'Looking for a furnished officetel for 3 months, walking distance to subway, budget around 700k KRW.', 'Jung-gu'],
  ['housing', 'No-realtor villa listing in Suseong', 'My landlord is re-listing our 2-room place and is okay with foreign tenants if paperwork is clear.', 'Suseong-gu'],
  ['jobs', 'Cafe hiring English-speaking weekend staff', 'Saw a handwritten sign at a brunch cafe. They prefer conversational Korean but are open to foreigners.', 'Nam-gu'],
  ['jobs', 'Any recruiters focused on F visas in Daegu?', 'Trying to avoid spam recruiters and want someone who understands bilingual office roles.', 'Dalseo-gu'],
  ['daily-life', 'Foreigner-friendly dentist with Saturday hours', 'Need somewhere gentle, English-friendly, and not impossible to book.', 'Buk-gu'],
  ['daily-life', 'How long did your ARC address update take?', 'I moved districts and want to know realistic processing times this month.', 'Seo-gu'],
  ['events', 'Sunday board game meetup for newcomers', 'Small English-speaking meetup, low-pressure, mostly people in their first year here.', 'Suseong-gu'],
  ['marketplace', 'Selling rice cooker and floor lamp before moving', 'Pickup only near Kyemyung University station, both used but clean.', 'Dalseo-gu'],
];

export const posts: PostRecord[] = Array.from({ length: 40 }).map((_, index) => {
  const template = basePosts[index % basePosts.length];
  const author = profiles[index % profiles.length];
  const createdAt = subHours(new Date(), index * 3).toISOString();
  return {
    id: `post-${index + 1}`,
    author,
    category: template[0] as PostRecord['category'],
    title: `${template[1]} ${index > 7 ? `#${index + 1}` : ''}`.trim(),
    body: `${template[2]}\n\nExtra context: ${index % 2 === 0 ? 'Open to DMs.' : 'Would love public replies so others can benefit.'}`,
    city: 'Daegu',
    district: template[3],
    tags: [template[0], template[3].toLowerCase(), index % 2 === 0 ? 'newcomer' : 'practical'],
    createdAt,
    likesCount: 3 + (index % 12),
    commentsCount: 1 + (index % 5),
    bookmarked: index % 4 === 0,
    analysis: {
      label: template[0] as PostRecord['analysis']['label'],
      score: 0.82 + ((index % 6) * 0.02),
      explanation: `Detected ${template[0]} intent from explicit community language and local context.`,
    },
  };
});

export const comments: CommentRecord[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    author: profiles[1],
    body: 'I toured a similar place last week. Happy to share the broker contact if you still need it.',
    createdAt: subHours(new Date(), 2).toISOString(),
  },
  {
    id: 'comment-2',
    postId: 'post-2',
    author: profiles[2],
    body: 'Ask whether maintenance includes heating. That part surprised me on my last contract.',
    createdAt: subHours(new Date(), 4).toISOString(),
  },
];

export const categories = [
  { slug: 'housing', label: 'Housing', description: 'Apartments, officetels, contracts, deposits.' },
  { slug: 'jobs', label: 'Jobs', description: 'Hiring posts, referrals, visa-compatible work.' },
  { slug: 'daily-life', label: 'Daily Life', description: 'Banking, hospitals, ARC, language, routines.' },
  { slug: 'events', label: 'Events', description: 'Meetups, classes, language exchange, social plans.' },
  { slug: 'marketplace', label: 'Marketplace', description: 'Buy/sell useful items for expat life.' },
] as const;

export const getPostById = (id: string) => posts.find((post) => post.id === id);
export const getCommentsByPostId = (postId: string) => comments.filter((comment) => comment.postId === postId);
export const getProfileByUsername = (username: string) => profiles.find((profile) => profile.username === username);
export const getPostsByCategory = (category: string) => posts.filter((post) => post.category === category);
