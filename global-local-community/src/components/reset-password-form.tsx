"use client";

import { useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { buildSiteUrl } from '@/lib/site-url';

export function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleReset() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage('Supabase is not configured yet.');
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildSiteUrl('/auth/recovery'),
    });
    setBusy(false);
    setMessage(error ? error.message : 'Password reset link sent. Check your email.');
  }

  return (
    <div className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-[var(--text-primary)] outline-none ring-[var(--border-strong)] focus:ring"
      />
      <button
        type="button"
        onClick={handleReset}
        disabled={busy}
        className="rounded-full bg-[var(--text-primary)] px-5 py-3 text-sm font-medium text-[var(--surface-primary)] hover:opacity-90 disabled:opacity-60"
      >
        {busy ? 'Sending...' : 'Send reset link'}
      </button>
      <p className="text-sm text-[var(--text-tertiary)]">
        Remembered it? <Link href="/" className="font-medium text-[var(--accent-primary)]">Back to sign in</Link>
      </p>
      {message ? <p className="text-sm text-[var(--text-secondary)]">{message}</p> : null}
    </div>
  );
}
