import { NextResponse } from 'next/server';
import { seedDemoPostsIfNeeded } from '@/lib/demo-seed';

async function runSeed() {
  try {
    const result = await seedDemoPostsIfNeeded();
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown seed error',
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  return runSeed();
}

export async function GET() {
  return runSeed();
}
