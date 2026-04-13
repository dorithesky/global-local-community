import { randomUUID } from 'crypto';
import { getAllowedImageExtension, getMediaBucketName, isAllowedImageExtension, isAllowedImageMimeType, isSafeStoragePath, IMAGE_UPLOAD_RULES } from './media';
import { sanitizePlainText } from './security';

export const PENDING_UPLOAD_TTL_MINUTES = 30;

export type UploadAuthorizationInput = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export function buildPendingUploadAuthorization(input: UploadAuthorizationInput, userId: string) {
  const fileName = sanitizePlainText(input.fileName, { maxLength: 120, allowNewlines: false });
  const mimeType = sanitizePlainText(input.mimeType, { maxLength: 80, allowNewlines: false }).toLowerCase();
  const extension = getAllowedImageExtension(fileName);
  const sizeBytes = Number(input.sizeBytes);

  if (!fileName || !isAllowedImageExtension(extension) || !isAllowedImageMimeType(mimeType)) {
    throw new Error('Only image files in JPG, JPEG, PNG, or WebP format are allowed.');
  }

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > IMAGE_UPLOAD_RULES.maxBytesPerFile) {
    throw new Error('Each image must be 5MB or smaller.');
  }

  const uploadId = randomUUID();
  const uploadToken = randomUUID();
  const storagePath = `pending/${userId}/${uploadId}.${extension}`;

  if (!isSafeStoragePath(storagePath)) {
    throw new Error('Invalid upload path.');
  }

  const expiresAt = new Date(Date.now() + PENDING_UPLOAD_TTL_MINUTES * 60 * 1000).toISOString();

  return {
    id: uploadId,
    uploadToken,
    bucket: getMediaBucketName(),
    storagePath,
    originalFileName: fileName,
    mimeType,
    sizeBytes,
    expiresAt,
  };
}
