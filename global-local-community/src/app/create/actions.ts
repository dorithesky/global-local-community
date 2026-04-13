"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { classifyContent, detectToxicityOrSpam } from '@/lib/intelligence';
import { assertAccountMaturity, assertMemberCan, assertRateLimit, getCurrentMember } from '@/lib/auth';
import { logServerRequest } from '@/lib/request-logging';
import { sanitizePlainText, sanitizeTagList } from '@/lib/security';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { validatePendingUploadBatch } from '@/lib/upload-validation';

export async function createPostAction(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) {
    redirect('/#signin');
  }

  await assertMemberCan('post');
  await assertAccountMaturity('post');
  await assertRateLimit('post');

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const title = sanitizePlainText(formData.get('title'), { maxLength: 140, allowNewlines: false });
  const body = sanitizePlainText(formData.get('body'), { maxLength: 5000, allowNewlines: true });
  const category = sanitizePlainText(formData.get('category') ?? 'daily-life', { maxLength: 40, allowNewlines: false });
  const district = sanitizePlainText(formData.get('district'), { maxLength: 80, allowNewlines: false });
  const tags = sanitizeTagList(formData.get('tags'));
  const city = sanitizePlainText(formData.get('city') ?? process.env.NEXT_PUBLIC_CITY ?? 'Seoul', { maxLength: 40, allowNewlines: false }) || 'Seoul';

  if (!title || !body) {
    throw new Error('Title and body are required.');
  }

  const uploadIds = formData.getAll('uploadIds').map(String).filter(Boolean).slice(0, 4);
  const uploadTokens = formData.getAll('uploadTokens').map(String).filter(Boolean).slice(0, 4);

  if (uploadIds.length !== uploadTokens.length) {
    throw new Error('Uploaded media authorization is incomplete.');
  }

  let validatedUploads: Array<{
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
  }> = [];

  if (uploadIds.length) {
    const { data: pendingRows, error: pendingError } = await supabase
      .from('pending_uploads')
      .select('id, user_id, bucket, storage_path, mime_type, size_bytes, status, upload_token, expires_at, attached_post_id')
      .in('id', uploadIds)
      .eq('user_id', member.id);

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

    validatedUploads = validatePendingUploadBatch(orderedRows, member.id);
  }

  const classification = classifyContent({ title, body });
  const safety = detectToxicityOrSpam({ title, body });
  const moderationStatus = safety.label === 'spam-risk' && safety.score >= 0.7 ? 'review' : 'published';

  const imageUrls = validatedUploads.map((file) => `pending://${file.bucket}/${file.storage_path}`);

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: member.id,
      category,
      title,
      body,
      city,
      district: district || null,
      tags,
      image_urls: imageUrls,
      ai_label: classification.label,
      ai_score: classification.score,
      ai_explanation: `${classification.explanation} ${safety.explanation}`,
      moderation_status: moderationStatus,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (validatedUploads.length) {
    const mediaRows = validatedUploads.map((file) => ({
      post_id: data.id,
      storage_path: file.storage_path,
      public_url: `pending://${file.bucket}/${file.storage_path}`,
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
        attached_post_id: data.id,
        attached_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('id', validatedUploads.map((file) => file.id))
      .eq('user_id', member.id);

    if (pendingUpdateError) {
      throw new Error(pendingUpdateError.message);
    }
  }

  await supabase.from('workflow_events').insert({
    event_type: 'post.created',
    entity_type: 'post',
    entity_id: data.id,
    payload: {
      title,
      category,
      moderation_status: moderationStatus,
      ai_label: classification.label,
      ai_score: classification.score,
    },
  });

  await logServerRequest({
    userId: member.id,
    path: '/create',
  });

  revalidatePath('/');
  revalidatePath('/feed');
  revalidatePath(`/categories/${category}`);
  redirect(`/posts/${data.id}`);
}
