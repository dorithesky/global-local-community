"use client";

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CreatePostForm } from '@/components/create-post-form';
import { validateImageFiles } from '@/lib/media';
import { uploadImagesToSupabase } from '@/lib/storage';

const DRAFT_KEY = 'glc-create-draft';

function getExistingDraftMessage() {
  if (typeof window === 'undefined') return null;
  const draft = window.sessionStorage.getItem(DRAFT_KEY);
  if (!draft) return null;
  return 'A local draft exists in this browser session. If you were signed out for inactivity, re-enter the form using the same tab and reuse your draft details.';
}

export function CreatePostClientShell({
  action,
  city,
}: {
  action: (formData: FormData) => Promise<void>;
  city: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const helperText = useMemo(() => {
    if (statusMessage) return statusMessage;
    if (pending) return 'Working on your post...';
    return null;
  }, [pending, statusMessage]);

  const draftMessage = useMemo(() => getExistingDraftMessage(), []);

  async function wrappedAction(formData: FormData) {
    setError(null);
    setStatusMessage(null);
    const validationMessage = validateImageFiles(files);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const draft = {
      city: String(formData.get('city') ?? ''),
      district: String(formData.get('district') ?? ''),
      category: String(formData.get('category') ?? ''),
      title: String(formData.get('title') ?? ''),
      body: String(formData.get('body') ?? ''),
      tags: String(formData.get('tags') ?? ''),
      savedAt: new Date().toISOString(),
    };
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

    startTransition(async () => {
      try {
        setStatusMessage(files.length ? 'Uploading images and preparing your post...' : 'Publishing your post...');

        if (files.length) {
          const uploaded = await uploadImagesToSupabase(files);
          uploaded.forEach((file) => {
            formData.append('uploadIds', file.uploadId);
            formData.append('uploadTokens', file.uploadToken);
            formData.append('imageStoragePaths', file.storagePath);
            formData.append('imageMimeTypes', file.mimeType);
            formData.append('imageSizeBytes', String(file.sizeBytes));
            formData.append('imageExpiresAt', file.expiresAt);
          });
        }

        setStatusMessage('Publishing your post now...');
        setStatusMessage('Post published. Opening it now...');
        await action(formData);
        window.sessionStorage.removeItem(DRAFT_KEY);
        router.refresh();
      } catch (uploadError) {
        setStatusMessage(null);
        setError(uploadError instanceof Error ? uploadError.message : 'Image upload failed.');
      }
    });
  }

  return (
    <div className="space-y-4">
      <CreatePostForm action={wrappedAction} city={city} onImagesSelected={setFiles} submitLabel={pending ? 'Uploading...' : 'Publish post'} />
      {draftMessage ? <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800 shadow-sm">{draftMessage}</p> : null}
      {helperText ? <p className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm">{helperText}</p> : null}
      {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 shadow-sm">{error}</p> : null}
    </div>
  );
}
