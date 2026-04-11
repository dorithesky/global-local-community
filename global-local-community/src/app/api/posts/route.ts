import { NextResponse } from 'next/server';
import { z } from 'zod';
import { posts } from '@/lib/mock-data';
import { classifyContent, detectToxicityOrSpam } from '@/lib/intelligence';
import { enqueueWorkflow } from '@/lib/orchestration';

const createPostSchema = z.object({
  title: z.string().min(5),
  body: z.string().min(20),
  category: z.enum(['housing', 'jobs', 'daily-life', 'events', 'marketplace']),
  city: z.string().default('Daegu'),
});

export async function GET() {
  return NextResponse.json({
    data: posts,
    pagination: {
      cursor: null,
      hasMore: false,
    },
  });
}

export async function POST(request: Request) {
  const payload = createPostSchema.parse(await request.json());
  const classification = classifyContent(payload);
  const moderation = detectToxicityOrSpam(payload);
  const workflow = enqueueWorkflow('post.created', {
    title: payload.title,
    city: payload.city,
    category: payload.category,
  });

  return NextResponse.json(
    {
      data: {
        ...payload,
        classification,
        moderation,
        workflow,
      },
    },
    { status: 201 },
  );
}
