"use client";

import { useState } from 'react';
import { AuthModal } from '@/components/auth-modal';

export function SignInGuard({
  title,
  description,
  ctaLabel,
  className,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={className}>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          {ctaLabel}
        </button>
      </div>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
