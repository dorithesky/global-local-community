"use client";

import { useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

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
      redirectTo: `${window.location.origin}/auth/callback`,
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
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-sky-200 focus:ring"
      />
      <button
        type="button"
        onClick={handleReset}
        disabled={busy}
        className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {busy ? 'Sending...' : 'Send reset link'}
      </button>
      <p className="text-sm text-slate-500">
        Remembered it? <Link href="/" className="font-medium text-sky-700">Back to sign in</Link>
      </p>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
