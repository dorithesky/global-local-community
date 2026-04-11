import { NextResponse } from 'next/server';
import { seedDemoPostsIfNeeded } from '@/lib/demo-seed';

export async function POST() {
  const result = await seedDemoPostsIfNeeded();
  return NextResponse.json({ data: result });
}
