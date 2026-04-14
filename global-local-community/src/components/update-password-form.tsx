"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

export function UpdatePasswordForm() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const passwordChecks = useMemo(() => ({
    minLength: password.length >= 7,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  }), [password]);

  async function handleUpdate() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage('Supabase is not configured yet.');
      return;
    }

    if (!Object.values(passwordChecks).every(Boolean)) {
      setMessage('Use a stronger password that meets all rules.');
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Password updated. Redirecting to the feed...');
    router.push('/feed');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter your new password"
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-sky-200 focus:ring"
      />
      {password.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] text-sm text-[var(--text-secondary)] transition-all">
          <div className="border-b border-[var(--border-subtle)] px-4 py-2.5">
            <p className="font-medium text-[var(--text-primary)]">Password strength</p>
          </div>
          <div className="space-y-2 px-4 py-3">
            <div className={`flex items-center gap-2 ${passwordChecks.minLength ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`}><span>{passwordChecks.minLength ? '●' : '○'}</span><span>7 or more characters</span></div>
            <div className={`flex items-center gap-2 ${passwordChecks.uppercase ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`}><span>{passwordChecks.uppercase ? '●' : '○'}</span><span>At least one uppercase letter</span></div>
            <div className={`flex items-center gap-2 ${passwordChecks.lowercase ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`}><span>{passwordChecks.lowercase ? '●' : '○'}</span><span>At least one lowercase letter</span></div>
            <div className={`flex items-center gap-2 ${passwordChecks.number ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`}><span>{passwordChecks.number ? '●' : '○'}</span><span>At least one number</span></div>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={handleUpdate}
        disabled={busy}
        className="rounded-full bg-[var(--text-primary)] px-5 py-3 text-sm font-medium text-[var(--surface-primary)] hover:opacity-90 disabled:opacity-60"
      >
        {busy ? 'Updating...' : 'Update password'}
      </button>
      {message ? <p className="text-sm text-[var(--text-secondary)]">{message}</p> : null}
    </div>
  );
}
