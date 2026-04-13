import type { SupabaseClient } from '@supabase/supabase-js';
import { getMediaBucketName, isAllowedImageMimeType, isSafePublicImageUrl, isSafeStoragePath, IMAGE_UPLOAD_RULES } from './media';

type PendingUploadRecord = {
  id: string;
  user_id: string;
  bucket: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  status: 'authorized' | 'uploaded' | 'attached' | 'expired' | 'rejected';
  upload_token: string;
  expires_at: string;
  attached_post_id?: string | null;
};

export function validatePendingUploadBatch(records: PendingUploadRecord[], userId: string, requireUploaded = false) {
  if (records.length > IMAGE_UPLOAD_RULES.maxFiles) {
    throw new Error(`You can upload up to ${IMAGE_UPLOAD_RULES.maxFiles} images.`);
  }

  const bucket = getMediaBucketName();
  let totalBytes = 0;
  const seenIds = new Set<string>();
  const seenPaths = new Set<string>();
  const now = Date.now();

  for (const record of records) {
    totalBytes += record.size_bytes;

    if (!record.id || seenIds.has(record.id)) {
      throw new Error('Duplicate or invalid upload record.');
    }
    seenIds.add(record.id);

    if (record.user_id !== userId) {
      throw new Error('Upload does not belong to the current user.');
    }
    if (record.bucket !== bucket) {
      throw new Error('Upload bucket is invalid.');
    }
    if (!isAllowedImageMimeType(record.mime_type)) {
      throw new Error('Unsupported uploaded image type.');
    }
    if (record.size_bytes <= 0 || record.size_bytes > IMAGE_UPLOAD_RULES.maxBytesPerFile) {
      throw new Error('Each uploaded image must be 5MB or smaller.');
    }
    if (!isSafeStoragePath(record.storage_path)) {
      throw new Error('Invalid uploaded image path.');
    }
    if (seenPaths.has(record.storage_path)) {
      throw new Error('Duplicate upload path detected.');
    }
    seenPaths.add(record.storage_path);
    if (requireUploaded ? record.status !== 'uploaded' : record.status !== 'authorized' && record.status !== 'uploaded') {
      throw new Error(requireUploaded ? 'Upload is not ready to attach.' : 'Upload is not in an attachable state.');
    }
    if (record.attached_post_id) {
      throw new Error('Upload is already attached to a post.');
    }
    if (!record.upload_token) {
      throw new Error('Upload token is missing.');
    }
    if (Number.isNaN(new Date(record.expires_at).getTime()) || new Date(record.expires_at).getTime() <= now) {
      throw new Error('Upload authorization has expired.');
    }
  }

  if (totalBytes > IMAGE_UPLOAD_RULES.maxTotalBytes) {
    throw new Error('Total upload size must be 20MB or smaller per post.');
  }

  return records;
}

async function assertUploadedObjectsExist(supabase: SupabaseClient, records: PendingUploadRecord[]) {
  for (const record of records) {
    const { data, error } = await supabase.storage.from(record.bucket).createSignedUrl(record.storage_path, 60);
    if (error || !data?.signedUrl || !isSafePublicImageUrl(data.signedUrl, record.bucket)) {
      throw new Error('Uploaded image could not be verified in storage.');
    }
  }
}

export async function attachPendingUploadsToPost({
  supabase,
  userId,
  postId,
  uploadIds,
  uploadTokens,
  moderationStatus,
}: {
  supabase: SupabaseClient;
  userId: string;
  postId: string;
  uploadIds: string[];
  uploadTokens: string[];
  moderationStatus: string;
}) {
  if (!uploadIds.length) {
    await supabase.from('posts').update({ image_urls: [] }).eq('id', postId);
    return [];
  }

  const { data: pendingRows, error: pendingError } = await supabase
    .from('pending_uploads')
    .select('id, user_id, bucket, storage_path, mime_type, size_bytes, status, upload_token, expires_at, attached_post_id')
    .in('id', uploadIds)
    .eq('user_id', userId);

  if (pendingError) {
    throw new Error(pendingError.message);
  }

  if (!pendingRows || pendingRows.length !== uploadIds.length) {
    throw new Error('One or more uploaded files could not be validated.');
  }

  const rowMap = new Map(pendingRows.map((row) => [row.id, row]));
  const orderedRows = uploadIds.map((id, index) => {
    const row = rowMap.get(id);
    if (!row || row.upload_token !== uploadTokens[index]) {
      throw new Error('Uploaded media authorization did not match.');
    }
    return row;
  });

  const validatedUploads = validatePendingUploadBatch(orderedRows, userId, true);
  await assertUploadedObjectsExist(supabase, validatedUploads);

  const mediaRows = validatedUploads.map((file) => ({
    post_id: postId,
    storage_path: file.storage_path,
    public_url: file.storage_path,
    mime_type: file.mime_type,
    size_bytes: file.size_bytes,
    moderation_status: moderationStatus,
  }));

  const { error: mediaError } = await supabase.from('post_media').insert(mediaRows);
  if (mediaError) {
    throw new Error(mediaError.message);
  }

  const { error: pendingUpdateError } = await supabase
    .from('pending_uploads')
    .update({
      status: 'attached',
      attached_post_id: postId,
      attached_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .in('id', validatedUploads.map((file) => file.id))
    .eq('user_id', userId);

  if (pendingUpdateError) {
    throw new Error(pendingUpdateError.message);
  }

  const imageUrls = validatedUploads.map((file) => file.storage_path);
  const { error: postUpdateError } = await supabase.from('posts').update({ image_urls: imageUrls }).eq('id', postId);
  if (postUpdateError) {
    throw new Error(postUpdateError.message);
  }

  return imageUrls;
}
