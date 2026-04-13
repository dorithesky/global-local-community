import { NextResponse } from 'next/server';
import { getCurrentMember } from '@/lib/auth';
import { getMediaBucketName, IMAGE_UPLOAD_RULES } from '@/lib/media';
import { logServerRequest } from '@/lib/request-logging';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { buildPendingUploadAuthorization, type UploadAuthorizationInput } from '@/lib/upload-authorization';

export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const files: UploadAuthorizationInput[] = Array.isArray(body?.files) ? body.files : [];

  if (!files.length) {
    return NextResponse.json({ error: 'No files were provided.' }, { status: 400 });
  }

  if (files.length > IMAGE_UPLOAD_RULES.maxFiles) {
    return NextResponse.json({ error: `You can upload up to ${IMAGE_UPLOAD_RULES.maxFiles} images.` }, { status: 400 });
  }

  const authorizations = files.map((file) => buildPendingUploadAuthorization(file, member.id));
  const totalBytes = authorizations.reduce((sum, file) => sum + file.sizeBytes, 0);
  if (totalBytes > IMAGE_UPLOAD_RULES.maxTotalBytes) {
    return NextResponse.json({ error: 'Total upload size must be 20MB or smaller per post.' }, { status: 400 });
  }

  const { error } = await supabase.from('pending_uploads').insert(authorizations.map((file) => ({
    id: file.id,
    user_id: member.id,
    bucket: file.bucket,
    storage_path: file.storagePath,
    original_file_name: file.originalFileName,
    mime_type: file.mimeType,
    size_bytes: file.sizeBytes,
    status: 'authorized',
    upload_token: file.uploadToken,
    expires_at: file.expiresAt,
  })));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logServerRequest({ userId: member.id, path: '/api/uploads/authorize' });

  return NextResponse.json({
    data: {
      bucket: getMediaBucketName(),
      files: authorizations.map((file) => ({
        uploadId: file.id,
        uploadToken: file.uploadToken,
        bucket: file.bucket,
        storagePath: file.storagePath,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        expiresAt: file.expiresAt,
      })),
    },
  });
}

export async function PATCH(request: Request) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const uploadId = typeof body?.uploadId === 'string' ? body.uploadId : '';
  const uploadToken = typeof body?.uploadToken === 'string' ? body.uploadToken : '';

  if (!uploadId || !uploadToken) {
    return NextResponse.json({ error: 'Upload finalization is incomplete.' }, { status: 400 });
  }

  const { data: row, error: rowError } = await supabase
    .from('pending_uploads')
    .select('id, user_id, bucket, storage_path, upload_token, status')
    .eq('id', uploadId)
    .eq('user_id', member.id)
    .maybeSingle();

  if (rowError) {
    return NextResponse.json({ error: rowError.message }, { status: 400 });
  }

  if (!row || row.upload_token !== uploadToken) {
    return NextResponse.json({ error: 'Upload finalization did not match the authorized file.' }, { status: 400 });
  }

  if (row.status !== 'authorized') {
    return NextResponse.json({ error: 'Upload is not in a finalizable state.' }, { status: 400 });
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from(row.bucket).createSignedUrl(row.storage_path, 60);
  if (signedUrlError || !signedUrlData?.signedUrl) {
    return NextResponse.json({ error: 'Uploaded image could not be verified in storage.' }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from('pending_uploads')
    .update({
      status: 'uploaded',
      updated_at: new Date().toISOString(),
    })
    .eq('id', uploadId)
    .eq('user_id', member.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  await logServerRequest({ userId: member.id, path: '/api/uploads/authorize/finalize' });

  return NextResponse.json({ data: { uploadId, status: 'uploaded' } });
}
