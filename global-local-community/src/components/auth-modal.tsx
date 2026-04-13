"use client";

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { AuthButtons } from '@/components/auth-buttons';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      firstFocusable?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      lastFocusedElementRef.current?.focus();
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
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="flex max-h-[calc(100dvh-1rem-env(safe-area-inset-bottom))] w-full flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sr-only">
            <h2 id={titleId}>Authentication</h2>
            <p id={descriptionId}>Sign in or create an account to continue.</p>
          </div>
          <div className="sticky top-0 z-10 flex justify-end border-b border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sign-in dialog"
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
