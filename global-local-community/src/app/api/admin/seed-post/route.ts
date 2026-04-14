import { NextResponse } from 'next/server';
import { assertRateLimit, requireAdmin } from '@/lib/auth';
import { createAdminSeedPost } from '@/lib/admin-seed-post';

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await assertRateLimit('admin');

    const body = await request.json();
    const result = await createAdminSeedPost({
      actorId: admin.id,
      authorId: body.authorId,
      city: body.city,
      district: body.district,
      category: body.category,
      title: body.title,
      body: body.body,
      tags: body.tags,
    });

    return NextResponse.json({ ok: true, data: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not create seed post.' }, { status: 400 });
  }
}
