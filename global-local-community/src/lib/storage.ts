import { getSupabaseBrowserClient } from './supabase-browser';

export function getMediaBucketName() {
  return process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'post-media';
}

export async function uploadImagesToSupabase(files: File[], userId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const bucket = getMediaBucketName();
  const uploaded: Array<{ publicUrl: string; storagePath: string; mimeType: string; sizeBytes: number }> = [];

  for (const file of files) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const storagePath = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage.from(bucket).upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    uploaded.push({
      publicUrl: data.publicUrl,
      storagePath,
      mimeType: file.type,
      sizeBytes: file.size,
    });
  }

  return uploaded;
}
