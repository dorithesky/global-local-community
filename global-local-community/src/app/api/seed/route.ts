import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { seedDemoPostsIfNeeded } from '@/lib/demo-seed';

async function runSeed() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seed route is disabled in production.' }, { status: 403 });
  }

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
