import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assertAccountMaturity, assertMemberCan, assertRateLimit, getCurrentMember } from '@/lib/auth';
import { buildPendingUploadAuthorization, PENDING_UPLOAD_TTL_MINUTES } from '@/lib/upload-authorization';
import { getSupabaseServerClient } from '@/lib/supabase-server';

const authorizeSchema = z.object({
  files: z.array(z.object({
    fileName: z.string().min(1),
    mimeType: z.string().min(1),
    sizeBytes: z.number().positive(),
  })).min(1).max(4),
});

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await assertMemberCan('post');
  await assertAccountMaturity('post');
  await assertRateLimit('post');

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
  }

  const parsed = authorizeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const authorizations = parsed.data.files.map((file) => buildPendingUploadAuthorization(file, member.id));
  const totalBytes = authorizations.reduce((sum, file) => sum + file.sizeBytes, 0);
  if (totalBytes > 20 * 1024 * 1024) {
    return NextResponse.json({ error: 'Total upload size must be 20MB or smaller per post.' }, { status: 400 });
  }

  const { error } = await supabase.from('pending_uploads').insert(
    authorizations.map((item) => ({
      id: item.id,
      user_id: member.id,
      bucket: item.bucket,
      storage_path: item.storagePath,
      original_file_name: item.originalFileName,
      mime_type: item.mimeType,
      size_bytes: item.sizeBytes,
      upload_token: item.uploadToken,
      expires_at: item.expiresAt,
      status: 'authorized',
    })),
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    data: {
      uploadWindowMinutes: PENDING_UPLOAD_TTL_MINUTES,
      files: authorizations.map((item) => ({
        uploadId: item.id,
        uploadToken: item.uploadToken,
        bucket: item.bucket,
        storagePath: item.storagePath,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes,
        expiresAt: item.expiresAt,
      })),
    },
  });
}
