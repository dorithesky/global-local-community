"use client";

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { AuthButtons } from '@/components/auth-buttons';

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[var(--overlay)] px-4 py-16 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-primary)] text-[var(--text-secondary)] shadow-sm hover:bg-[var(--surface-muted)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3 shadow-2xl">
          <AuthButtons compact onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}
