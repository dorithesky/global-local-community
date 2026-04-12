export const IMAGE_UPLOAD_RULES = {
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFiles: 4,
  maxBytesPerFile: 5 * 1024 * 1024,
};

export function validateImageFiles(files: File[]) {
  if (files.length > IMAGE_UPLOAD_RULES.maxFiles) {
    return `You can upload up to ${IMAGE_UPLOAD_RULES.maxFiles} images.`;
  }

  for (const file of files) {
    if (!IMAGE_UPLOAD_RULES.acceptedTypes.includes(file.type)) {
      return 'Only JPG, PNG, and WebP images are allowed.';
    }
    if (file.size > IMAGE_UPLOAD_RULES.maxBytesPerFile) {
      return 'Each image must be 5MB or smaller.';
    }
  }

  return null;
}
