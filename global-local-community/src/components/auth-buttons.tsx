"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

type AuthMode = 'password-signup' | 'password-signin' | 'magic-link';

export function AuthButtons({ compact = false, onSuccess }: { compact?: boolean; onSuccess?: () => void } = {}) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('password-signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signInWithGoogle() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage('Supabase is not configured yet.');
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }

    onSuccess?.();
  }

  async function handleEmailAuth() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage('Supabase is not configured yet.');
      return;
    }

    if (!email) {
      setMessage('Enter an email address first.');
      return;
    }

    if (mode !== 'magic-link' && password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);

    if (mode === 'magic-link') {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      setBusy(false);
      setMessage(error ? error.message : 'Check your email for the sign-in link.');
      if (!error) {
        router.refresh();
        onSuccess?.();
      }
      return;
    }

    if (mode === 'password-signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      setBusy(false);
      setMessage(error ? error.message : 'Account created. Check your email if confirmation is required, or sign in right away.');
      if (!error) {
        router.refresh();
        onSuccess?.();
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    setMessage(error ? error.message : 'Signed in successfully.');
    if (!error) {
      router.refresh();
      onSuccess?.();
    }
  }

  return (
    <div id="signin" className={`space-y-4 rounded-3xl border border-slate-200 bg-white ${compact ? 'p-4 shadow-none' : 'p-5 shadow-sm'}`}>
      <div>
        <p className="text-sm font-semibold text-slate-900">Sign in or create account</p>
        <p className="mt-1 text-sm text-slate-600">Choose the auth flow that feels most natural: password, magic link, or Google.</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button type="button" onClick={() => setMode('password-signup')} className={`rounded-2xl px-3 py-2 text-sm font-medium ${mode === 'password-signup' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
          Email + password
        </button>
        <button type="button" onClick={() => setMode('password-signin')} className={`rounded-2xl px-3 py-2 text-sm font-medium ${mode === 'password-signin' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
          Sign in with password
        </button>
        <button type="button" onClick={() => setMode('magic-link')} className={`rounded-2xl px-3 py-2 text-sm font-medium ${mode === 'magic-link' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
          Magic link
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-sky-200 focus:ring"
        />
        {mode !== 'magic-link' ? (
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={mode === 'password-signup' ? 'Create a password' : 'Enter your password'}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-sky-200 focus:ring"
          />
        ) : null}
        <button
          type="button"
          onClick={handleEmailAuth}
          disabled={busy}
          className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {mode === 'password-signup' ? 'Create account' : mode === 'password-signin' ? 'Sign in' : 'Send magic link'}
        </button>
      </div>

      <div className="relative py-1 text-center text-xs uppercase tracking-[0.18em] text-slate-400">
        <span className="bg-white px-3">or</span>
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={busy}
        className="w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60"
      >
        Continue with Google
      </button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
