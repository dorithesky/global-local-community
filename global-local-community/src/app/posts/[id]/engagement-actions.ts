"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertMemberCan, getCurrentMember } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase-server';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function toggleLikeAction(postId: string) {
  if (!isUuid(postId)) {
    revalidatePath(`/posts/${postId}`);
    revalidatePath('/feed');
    return;
  }

  const member = await getCurrentMember();
  if (!member) redirect('/#signin');

  await assertMemberCan('engage');

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
  if (!isUuid(postId)) {
    revalidatePath(`/posts/${postId}`);
    revalidatePath('/feed');
    return;
  }

  const member = await getCurrentMember();
  if (!member) redirect('/#signin');

  await assertMemberCan('engage');

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

export async function deletePostAction(postId: string) {
  if (!isUuid(postId)) {
    revalidatePath(`/posts/${postId}`);
    revalidatePath('/feed');
    return;
  }

  const member = await getCurrentMember();
  if (!member) redirect('/#signin');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data: existing } = await supabase
    .from('posts')
    .select('id, author_id')
    .eq('id', postId)
    .maybeSingle();

  if (!existing || existing.author_id !== member.id) throw new Error('Unauthorized');

  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/feed');
  revalidatePath('/activity');
  redirect('/feed');
}
