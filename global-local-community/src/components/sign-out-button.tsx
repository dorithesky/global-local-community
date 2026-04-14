"use client";

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

export function SignOutButton({ compact = false }: { compact?: boolean } = {}) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={`${compact ? 'min-h-10 min-w-10 px-0 py-0' : 'min-h-11 px-3 py-2.5 text-sm'} inline-flex items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] font-medium text-[var(--text-secondary)] shadow-sm transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]`}
      aria-label="Sign out"
      title="Sign out"
    >
      {compact ? <LogOut className="h-4 w-4" /> : 'Sign out'}
    </button>
  );
}
