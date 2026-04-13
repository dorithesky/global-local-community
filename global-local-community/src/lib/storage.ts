import { getSupabaseBrowserClient } from './supabase-browser';
import { getAllowedImageExtension, isAllowedImageExtension, isAllowedImageMimeType, validateImageFiles } from './media';

export type AuthorizedUpload = {
  uploadId: string;
  uploadToken: string;
  bucket: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  expiresAt: string;
};

async function requestUploadAuthorization(files: File[]): Promise<AuthorizedUpload[]> {
  const response = await fetch('/api/uploads/authorize', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      files: files.map((file) => ({
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      })),
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error ?? 'Could not authorize uploads.');
  }

  return Array.isArray(payload?.data?.files) ? payload.data.files : [];
}

export async function uploadImagesToSupabase(files: File[]) {
  const validationMessage = validateImageFiles(files);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const authorizedUploads = await requestUploadAuthorization(files);
  if (authorizedUploads.length !== files.length) {
    throw new Error('Upload authorization did not match the selected files.');
  }

  const uploaded: Array<{
    uploadId: string;
    uploadToken: string;
    storagePath: string;
    mimeType: string;
    sizeBytes: number;
    expiresAt: string;
  }> = [];

  for (const [index, file] of files.entries()) {
    const authorization = authorizedUploads[index];
    const extension = getAllowedImageExtension(file.name) || 'jpg';

    if (!isAllowedImageMimeType(file.type) || !isAllowedImageExtension(extension)) {
      throw new Error('Only image files in JPG, JPEG, PNG, or WebP format are allowed.');
    }

    if (authorization.mimeType !== file.type || authorization.sizeBytes !== file.size) {
      throw new Error('Authorized upload metadata did not match the selected file.');
    }

    const { error } = await supabase.storage.from(authorization.bucket).upload(authorization.storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      throw new Error(error.message);
    }

    const uploadedAtResponse = await fetch('/api/uploads/authorize', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        uploadId: authorization.uploadId,
        uploadToken: authorization.uploadToken,
      }),
    });

    const uploadedAtPayload = await uploadedAtResponse.json().catch(() => null);
    if (!uploadedAtResponse.ok) {
      throw new Error(uploadedAtPayload?.error ?? 'Could not finalize uploaded media.');
    }

    uploaded.push({
      uploadId: authorization.uploadId,
      uploadToken: authorization.uploadToken,
      storagePath: authorization.storagePath,
      mimeType: authorization.mimeType,
      sizeBytes: authorization.sizeBytes,
      expiresAt: authorization.expiresAt,
    });
  }

  return uploaded;
}
