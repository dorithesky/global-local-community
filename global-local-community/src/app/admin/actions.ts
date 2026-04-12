"use server";

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function updateReportStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const reportId = String(formData.get('reportId') ?? '');
  const status = String(formData.get('status') ?? 'open');

  const { error } = await supabase.from('reports').update({ status }).eq('id', reportId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin');
}

export async function hideReportedPostAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const postId = String(formData.get('postId') ?? '');
  if (!postId) throw new Error('Missing post id');

  const { error } = await supabase.from('posts').update({ moderation_status: 'hidden' }).eq('id', postId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath(`/posts/${postId}`);
  revalidatePath('/feed');
}
