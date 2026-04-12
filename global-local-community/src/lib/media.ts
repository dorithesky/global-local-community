export const IMAGE_UPLOAD_RULES = {
  acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  acceptedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  maxFiles: 4,
  maxBytesPerFile: 20 * 1024 * 1024,
  maxTotalBytes: 50 * 1024 * 1024,
};

export function validateImageFiles(files: File[]) {
  if (files.length > IMAGE_UPLOAD_RULES.maxFiles) {
    return `You can upload up to ${IMAGE_UPLOAD_RULES.maxFiles} images.`;
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > IMAGE_UPLOAD_RULES.maxTotalBytes) {
    return 'Total upload size must be 50MB or smaller per post.';
  }

  for (const file of files) {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!IMAGE_UPLOAD_RULES.acceptedTypes.includes(file.type) || !IMAGE_UPLOAD_RULES.acceptedExtensions.includes(extension)) {
      return 'Only image files in JPG, JPEG, PNG, or WebP format are allowed.';
    }
    if (file.size > IMAGE_UPLOAD_RULES.maxBytesPerFile) {
      return 'Each image must be 20MB or smaller.';
    }
  }

  return null;
}
