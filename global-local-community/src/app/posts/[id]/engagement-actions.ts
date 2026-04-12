"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function toggleLikeAction(postId: string) {
  const member = await getCurrentMember();
  if (!member) redirect('/#signin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data: existing } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', member.id)
    .eq('post_id', postId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('likes').delete().eq('user_id', member.id).eq('post_id', postId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('likes').insert({ user_id: member.id, post_id: postId });
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath('/feed');
}

export async function toggleBookmarkAction(postId: string) {
  const member = await getCurrentMember();
  if (!member) redirect('/#signin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('post_id')
    .eq('user_id', member.id)
    .eq('post_id', postId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('bookmarks').delete().eq('user_id', member.id).eq('post_id', postId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('bookmarks').insert({ user_id: member.id, post_id: postId });
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath('/feed');
}
