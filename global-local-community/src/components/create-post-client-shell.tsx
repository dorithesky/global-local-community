"use client";

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CreatePostForm } from '@/components/create-post-form';
import { validateImageFiles } from '@/lib/media';
import { uploadImagesToSupabase } from '@/lib/storage';

export function CreatePostClientShell({
  action,
  city,
  memberId,
}: {
  action: (formData: FormData) => Promise<void>;
  city: string;
  memberId: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const helperText = useMemo(() => {
    if (pending) return 'Uploading images and publishing your post...';
    return null;
  }, [pending]);

  async function wrappedAction(formData: FormData) {
    setError(null);
    const validationMessage = validateImageFiles(files);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    startTransition(async () => {
      try {
        if (files.length) {
          const uploaded = await uploadImagesToSupabase(files, memberId);
          uploaded.forEach((file) => {
            formData.append('imageUrls', file.publicUrl);
            formData.append('imageStoragePaths', file.storagePath);
            formData.append('imageMimeTypes', file.mimeType);
            formData.append('imageSizeBytes', String(file.sizeBytes));
          });
        }

        await action(formData);
        router.refresh();
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Image upload failed.');
      }
    });
  }

  return (
    <div className="space-y-3">
      <CreatePostForm action={wrappedAction} city={city} onImagesSelected={setFiles} submitLabel={pending ? 'Uploading...' : 'Publish post'} />
      {helperText ? <p className="text-sm text-slate-500">{helperText}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
