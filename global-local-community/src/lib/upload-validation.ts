import { getMediaBucketName, isAllowedImageMimeType, isSafeStoragePath, IMAGE_UPLOAD_RULES } from './media';

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

export function validatePendingUploadBatch(records: PendingUploadRecord[], userId: string) {
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
    if (record.status !== 'authorized' && record.status !== 'uploaded') {
      throw new Error('Upload is not in an attachable state.');
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
