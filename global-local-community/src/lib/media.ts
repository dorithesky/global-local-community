export const IMAGE_UPLOAD_RULES = {
  acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  maxFiles: 4,
  maxBytesPerFile: 5 * 1024 * 1024,
  maxTotalBytes: 20 * 1024 * 1024,
};

export function getMediaBucketName() {
  return process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'post-media';
}

export function getAllowedImageExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

export function isAllowedImageMimeType(value: string) {
  return IMAGE_UPLOAD_RULES.acceptedTypes.includes(value.toLowerCase());
}

export function isAllowedImageExtension(value: string) {
  return IMAGE_UPLOAD_RULES.acceptedExtensions.includes(value.toLowerCase());
}

export function isSafeStoragePath(path: string, userId?: string) {
  if (!path || path.includes('..') || path.startsWith('/') || path.includes('\\')) return false;
  if (!/^[a-zA-Z0-9/_-]+\.(jpg|jpeg|png|webp)$/i.test(path)) return false;
  if (userId && !path.startsWith(`${userId}/`)) return false;
  return true;
}

export function isSafePublicImageUrl(url: string, bucket?: string) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') return false;
    if (bucket && !parsed.pathname.includes(`/${bucket}/`)) return false;
    return /\.(jpg|jpeg|png|webp)(\?|$)/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

export function validateImageFiles(files: File[]) {
  if (files.length > IMAGE_UPLOAD_RULES.maxFiles) {
    return `You can upload up to ${IMAGE_UPLOAD_RULES.maxFiles} images.`;
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > IMAGE_UPLOAD_RULES.maxTotalBytes) {
    return 'Total upload size must be 20MB or smaller per post.';
  }

  for (const file of files) {
    const extension = getAllowedImageExtension(file.name);
    if (!isAllowedImageMimeType(file.type) || !isAllowedImageExtension(extension)) {
      return 'Only image files in JPG, JPEG, PNG, or WebP format are allowed.';
    }
    if (file.size <= 0) {
      return 'Empty files are not allowed.';
    }
    if (file.size > IMAGE_UPLOAD_RULES.maxBytesPerFile) {
      return 'Each image must be 5MB or smaller.';
    }
  }

  return null;
}
