"use server";

import { revalidatePath } from 'next/cache';
import { getCurrentMember } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase-server';

export async function saveNotificationPreferencesAction(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) throw new Error('Unauthorized');

  const supabase = await getSupabaseServerClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const notifyLikes = formData.get('notifyLikes') === 'on';
  const notifyComments = formData.get('notifyComments') === 'on';
  const marketingEmails = formData.get('marketingEmails') === 'on';

  const { error } = await supabase.from('profiles').update({
    bio: `notifications:${JSON.stringify({ notifyLikes, notifyComments, marketingEmails })}`,
  }).eq('id', member.id);

  if (error) throw new Error(error.message);

  revalidatePath('/settings');
  revalidatePath(`/profile/${member.username}`);
}
