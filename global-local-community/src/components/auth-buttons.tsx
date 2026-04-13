"use client";

import { useMemo, useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
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

  const isCreatingPassword = view === 'signup' || signInMethod === 'password';
  const isSignupPassword = view === 'signup';
  const passwordChecks = useMemo(() => ({
    minLength: password.length >= 10,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  }), [password]);

  const signupPasswordValid = Object.values(passwordChecks).every(Boolean);

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

    if (view === 'signup' && !signupPasswordValid) {
      setMessage('Use a stronger password that meets all rules.');
      return;
    }

    if (view === 'signin' && signInMethod === 'password' && password.length < 1) {
      setMessage('Enter your password first.');
      return;
    }

    setBusy(true);

    if (view === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/settings?onboarding=1`,
        },
      });

      setBusy(false);
      setMessage(error ? error.message : 'Account created. Check your email for the confirmation link, then finish your onboarding in settings. Authentication events will be logged after callback/login completes.');
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
        <p className="mt-1 text-sm leading-5 text-slate-600">Create an account or sign in.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
        <button type="button" onClick={() => setView('signup')} className={`min-h-11 rounded-2xl px-3 py-2.5 text-sm font-medium ${view === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          Create account
        </button>
        <button type="button" onClick={() => setView('signin')} className={`min-h-11 rounded-2xl px-3 py-2.5 text-sm font-medium ${view === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          Sign in
        </button>
      </div>

      {view === 'signin' ? (
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          <button type="button" onClick={() => setSignInMethod('password')} className={`min-h-10 rounded-2xl px-3 py-2 text-sm font-medium ${signInMethod === 'password' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            Password
          </button>
          <button type="button" onClick={() => setSignInMethod('magic-link')} className={`min-h-10 rounded-2xl px-3 py-2 text-sm font-medium ${signInMethod === 'magic-link' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
            Magic link
          </button>
        </div>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring"
        />
        {isCreatingPassword ? (
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={view === 'signup' ? 'Create a password' : 'Enter your password'}
              className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring"
            />
            {isSignupPassword && password.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm text-slate-700 transition-all">
                <div className="border-b border-slate-100 px-4 py-2.5">
                  <p className="font-medium text-slate-900">Password strength</p>
                </div>
                <div className="space-y-2 px-4 py-3">
                  <div className={`flex items-center gap-2 ${passwordChecks.minLength ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {passwordChecks.minLength ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    <span>10 or more characters</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordChecks.uppercase ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {passwordChecks.uppercase ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    <span>At least one uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordChecks.lowercase ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {passwordChecks.lowercase ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    <span>At least one lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-2 ${passwordChecks.number ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {passwordChecks.number ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    <span>At least one number</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        <button
          type="button"
          onClick={handleEmailAuth}
          disabled={busy}
          className="min-h-11 w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
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
        className="min-h-11 flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-60"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
          <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.7 3.9-5.4 3.9-3.3 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6s4.1 9.2 9.2 9.2c5.3 0 8.8-3.7 8.8-8.9 0-.6-.1-1.1-.2-1.7H12Z" />
          <path fill="#34A853" d="M2.8 11.6c0 1.6.6 3 1.5 4.2l3.5-2.7c-.2-.5-.4-1-.4-1.6s.1-1.1.4-1.6L4.3 7.2c-.9 1.2-1.5 2.7-1.5 4.4Z" />
          <path fill="#FBBC05" d="M12 20.8c2.5 0 4.6-.8 6.2-2.3l-3-2.4c-.8.6-1.8 1-3.2 1-2.5 0-4.7-1.7-5.4-4l-3.6 2.7c1.6 3 4.8 5 9 5Z" />
          <path fill="#4285F4" d="M18.2 18.5c1.8-1.6 2.6-4 2.6-6.6 0-.6-.1-1.1-.2-1.7H12v3.9h5.4c-.1.9-.6 2.2-1.7 3.1l2.5 1.3Z" />
        </svg>
        <span>Continue with Google</span>
      </button>
      {view === 'signin' && signInMethod === 'password' ? (
        <p className="text-sm leading-6 text-slate-500">
          Forgot your password? <a href="/auth/reset" className="font-medium text-sky-700">Reset it here</a>
        </p>
      ) : null}
      {message ? <p className="text-sm leading-6 text-slate-600">{message}</p> : null}
      {view === 'signup' && !message ? (
        <p className="text-sm leading-5 text-slate-500">Use an email you can access. You may need to confirm it before signing in.</p>
      ) : null}
    </div>
  );
}
