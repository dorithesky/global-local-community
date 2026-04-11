import { NextResponse } from 'next/server';
import { z } from 'zod';
import { enqueueWorkflow } from '@/lib/orchestration';

const reportSchema = z.object({
  postId: z.string(),
  reason: z.string().min(3),
  details: z.string().optional(),
});

export async function POST(request: Request) {
  const payload = reportSchema.parse(await request.json());
  const workflow = enqueueWorkflow('report.created', payload);

  return NextResponse.json({
    data: {
      status: 'queued',
      workflow,
    },
  });
}
