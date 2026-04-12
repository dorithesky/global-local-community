"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

type AuthView = 'signup' | 'signin';
type SignInMethod = 'password' | 'magic-link';

export function AuthButtons({ compact = false, onSuccess }: { compact?: boolean; onSuccess?: () => void } = {}) {
  const router = useRouter();
  const [view, setView] = useState<AuthView>('signup');
  const [signInMethod, setSignInMethod] = useState<SignInMethod>('password');
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

    if ((view === 'signup' || signInMethod === 'password') && password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);

    if (view === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      setBusy(false);
      setMessage(error ? error.message : 'Account created. Check your email if confirmation is required.');
      if (!error) {
        router.refresh();
        onSuccess?.();
      }
      return;
    }

    if (signInMethod === 'magic-link') {
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
        <p className="text-sm font-semibold text-slate-900">Welcome</p>
        <p className="mt-1 text-sm text-slate-600">Make the first choice obvious: create an account, or sign in to an existing one.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
        <button type="button" onClick={() => setView('signup')} className={`rounded-2xl px-3 py-2.5 text-sm font-medium ${view === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          Create account
        </button>
        <button type="button" onClick={() => setView('signin')} className={`rounded-2xl px-3 py-2.5 text-sm font-medium ${view === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          Sign in
        </button>
      </div>

      {view === 'signin' ? (
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button type="button" onClick={() => setSignInMethod('password')} className={`rounded-2xl px-3 py-2 text-sm font-medium ${signInMethod === 'password' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            Password
          </button>
          <button type="button" onClick={() => setSignInMethod('magic-link')} className={`rounded-2xl px-3 py-2 text-sm font-medium ${signInMethod === 'magic-link' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            Magic link
          </button>
        </div>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {view === 'signup' ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <p className="font-medium">Before you create your account</p>
            <ul className="mt-2 list-disc pl-5 text-sm leading-6 text-sky-900">
              <li>Use a real email you can access right now</li>
              <li>You may need to confirm the account from your inbox before signing in</li>
              <li>Password must be at least 6 characters</li>
            </ul>
          </div>
        ) : null}
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-sky-200 focus:ring"
        />
        {(view === 'signup' || signInMethod === 'password') ? (
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={view === 'signup' ? 'Create a password' : 'Enter your password'}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-sky-200 focus:ring"
            />
            <p className="text-xs leading-6 text-slate-500">
              Password rules: minimum 6 characters. For a real public launch, use a stronger password than something short or reused.
            </p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={handleEmailAuth}
          disabled={busy}
          className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {view === 'signup' ? 'Create account' : signInMethod === 'password' ? 'Sign in' : 'Send magic link'}
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
      {view === 'signin' && signInMethod === 'password' ? (
        <p className="text-sm text-slate-500">
          Forgot your password? <a href="/auth/reset" className="font-medium text-sky-700">Reset it here</a>
        </p>
      ) : null}
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      {view === 'signup' && !message ? (
        <p className="text-sm text-slate-500">After creating your account, check your inbox for a confirmation email if Supabase email confirmation is enabled.</p>
      ) : null}
    </div>
  );
}
