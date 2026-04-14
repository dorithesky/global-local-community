import { subHours } from 'date-fns';
import type { CommentRecord, PostRecord, Profile } from './types';

const profiles: Profile[] = [
  {
    id: '1',
    username: 'mina-expat',
    displayName: 'Mina Carter',
    bio: 'Community host helping newcomers settle into Seoul paperwork and housing routines.',
    city: 'Seoul',
    originCountry: 'Canada',
    occupation: 'Teacher',
  },
  {
    id: '2',
    username: 'jaynomad',
    displayName: 'Jay Park',
    bio: 'Sharing practical Korea life tips after years of moving between Busan and Seoul.',
    city: 'Busan',
    originCountry: 'USA',
    occupation: 'Designer',
  },
  {
    id: '3',
    username: 'sara-abroad',
    displayName: 'Sara Kim',
    bio: 'Helping people compare leases, job paths, and local admin steps in Korea.',
    city: 'Daegu',
    originCountry: 'UK',
    occupation: 'Recruiter',
  },
];

const basePosts = [
  ['housing', 'Need a short-term officetel near Hongdae', 'Looking for a furnished officetel for 3 months, walking distance to Line 2, budget around 1.2M KRW, and ideally no huge key money.', 'Seoul', 'Mapo-gu'],
  ['housing', 'No-realtor villa listing near Centum', 'My landlord is re-listing our 2-room place and is okay with foreign tenants if paperwork is clear and the deposit transfer timing is explained well.', 'Busan', 'Haeundae-gu'],
  ['jobs', 'Cafe hiring English-speaking weekend staff in Daegu', 'Saw a handwritten sign at a brunch cafe near Kyungpook National University. They prefer conversational Korean but are open to foreigners with valid work status.', 'Daegu', 'Buk-gu'],
  ['jobs', 'Any recruiters focused on F visas in Seoul?', 'Trying to avoid spam recruiters and want someone who understands bilingual office roles, visa realities, and real salary bands in Seoul.', 'Seoul', 'Jongno-gu'],
  ['healthcare', 'Foreigner-friendly dentist with Saturday hours in Busan', 'Need somewhere gentle, English-friendly, and not impossible to book. Bonus if they explain insurance coverage clearly.', 'Busan', 'Suyeong-gu'],
  ['visa', 'How long did your ARC address update take this month?', 'I moved districts and want realistic timelines for immigration plus whether the 주민센터 update was enough before my bank app stopped matching.', 'Daegu', 'Suseong-gu'],
  ['meetups', 'Sunday board game meetup for newcomers in Itaewon', 'Small English-speaking meetup, low-pressure, mostly people in their first year here who want community without a huge party scene.', 'Seoul', 'Yongsan-gu'],
  ['marketplace', 'Selling rice cooker and floor lamp before moving cities', 'Pickup only near Jeonju Station this weekend. Good for someone setting up their first Korean apartment on a budget.', 'Other', 'Jeonju'],
  ['banking', 'Which Korean bank app has been easiest with ARC verification lately?', 'Trying to open a more reliable account for transfers and bill payments without repeated identity check failures.', 'Seoul', 'Seodaemun-gu'],
  ['transport', 'Best intercity commute setup if you work in Seoul but live outside it?', 'Curious what people are realistically doing with KTX, express buses, or split-week routines.', 'Other', 'Suwon'],
  ['documents', 'What paperwork did your landlord ask for during contract renewal?', 'Trying to prepare documents before renewal week so I do not get blindsided by extra admin requests.', 'Incheon', 'Bupyeong-gu'],
  ['local-tips', 'Most foreigner-friendly neighborhoods in Daejeon for daily errands?', 'Looking for places where grocery shopping, gyms, and daily admin feel manageable without constant friction.', 'Daejeon', 'Yuseong-gu'],
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
    body: `${template[2]}\n\nExtra context: ${index % 2 === 0 ? 'Open to public replies so others in Korea can use the info too.' : 'If you solved something similar in Korea recently, please share what actually worked.'}`,
    city: template[3],
    district: template[4],
    tags: [template[0], String(template[4]).toLowerCase(), String(template[3]).toLowerCase(), index % 2 === 0 ? 'korea-life' : 'newcomer'],
    createdAt,
    likesCount: 3 + (index % 12),
    commentsCount: 1 + (index % 5),
    bookmarked: index % 4 === 0,
    analysis: {
      label: template[0] as PostRecord['analysis']['label'],
      score: 0.82 + ((index % 6) * 0.02),
      explanation: `Detected ${template[0]} intent from explicit Korea-specific community language and local context.`,
    },
  };
});

export const comments: CommentRecord[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    author: profiles[1],
    body: 'I toured a similar place last week. Happy to share the broker contact if you still need it, and I can tell you what the maintenance fee really covered.',
    createdAt: subHours(new Date(), 2).toISOString(),
    depth: 0,
    replyCount: 1,
    rootCommentId: 'comment-1',
    replies: [
      {
        id: 'comment-1-reply-1',
        postId: 'post-1',
        author: profiles[0],
        body: 'Yes please, especially if they were clear about maintenance and key money timing.',
        createdAt: subHours(new Date(), 1).toISOString(),
        depth: 1,
        parentCommentId: 'comment-1',
        rootCommentId: 'comment-1',
        replyTarget: profiles[1],
      },
    ],
  },
  {
    id: 'comment-2',
    postId: 'post-2',
    author: profiles[2],
    body: 'Ask whether maintenance includes heating and building internet. That part surprised me on my last contract in Busan.',
    createdAt: subHours(new Date(), 4).toISOString(),
    depth: 0,
    replyCount: 0,
    rootCommentId: 'comment-2',
    replies: [],
  },
];

export const categories = [
  { slug: 'housing', label: 'Housing', description: 'Apartments, officetels, contracts, deposits.' },
  { slug: 'jobs', label: 'Jobs', description: 'Hiring posts, referrals, visa-compatible work.' },
  { slug: 'visa', label: 'Visa & ARC', description: 'Immigration, ARC, sponsorship, and extension questions.' },
  { slug: 'healthcare', label: 'Healthcare', description: 'Hospitals, clinics, insurance, and prescriptions.' },
  { slug: 'banking', label: 'Banking', description: 'Transfers, cards, bank accounts, and app verification.' },
  { slug: 'phone-internet', label: 'Phone & Internet', description: 'SIMs, plans, internet setup, and carrier issues.' },
  { slug: 'transport', label: 'Transport', description: 'Subway, bus, taxis, KTX, and commuting.' },
  { slug: 'documents', label: 'Documents', description: 'Government paperwork, registrations, and admin tasks.' },
  { slug: 'daily-life', label: 'Daily Life', description: 'Everyday routines, apps, etiquette, and practical friction.' },
  { slug: 'events', label: 'Events', description: 'Public happenings, classes, and social plans.' },
  { slug: 'meetups', label: 'Meetups', description: 'Smaller gatherings, networking, and hobby groups.' },
  { slug: 'local-tips', label: 'Local Tips', description: 'Neighborhood advice and practical recommendations.' },
  { slug: 'marketplace', label: 'Marketplace', description: 'Buy/sell useful items for expat life.' },
] as const;

export const getPostById = (id: string) => posts.find((post) => post.id === id);
export const getCommentsByPostId = (postId: string) => comments.filter((comment) => comment.postId === postId);
