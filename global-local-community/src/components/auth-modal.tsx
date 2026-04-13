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
    <div
      className="fixed inset-0 z-[100] bg-[var(--overlay)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-sm sm:px-6 sm:py-6"
      onClick={onClose}
    >
      <div className="mx-auto flex h-full w-full max-w-md items-start justify-center">
        <div
          className="flex max-h-[calc(100dvh-1rem-env(safe-area-inset-bottom))] w-full flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex justify-end border-b border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-secondary)] shadow-sm hover:bg-[var(--surface-primary)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-4 sm:pb-4">
            <AuthButtons compact onSuccess={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}
