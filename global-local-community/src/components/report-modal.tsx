"use client";

import { useEffect, useId } from 'react';
import { Flag, X } from 'lucide-react';
import type { ReportActionState } from '@/lib/report-state';
import { ReportForm } from '@/components/post-engagement-forms';

export function ReportModal({
  open,
  onClose,
  action,
  title,
  description,
  targetLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  action: (state: ReportActionState, formData: FormData) => Promise<ReportActionState>;
  title: string;
  description: string;
  targetLabel: string;
  children?: React.ReactNode;
}) {
  const titleId = useId();
  const descriptionId = useId();

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
      className="fixed inset-0 z-[110] bg-[var(--overlay)] px-0 pt-0 backdrop-blur-sm sm:px-6 sm:py-6"
      onClick={onClose}
    >
      <div className="flex h-full w-full items-end justify-center sm:items-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="flex max-h-[min(82dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2rem]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-5 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
            <div className="min-w-0">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Flag className="h-5 w-5" />
              </div>
              <h2 id={titleId} className="mt-3 text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
              <p id={descriptionId} className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-secondary)] transition hover:bg-[var(--surface-primary)] hover:text-[var(--text-primary)]"
              aria-label="Close report dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pb-6">
            <ReportForm
              action={action}
              compact
              targetLabel={targetLabel}
              onSuccess={() => undefined}
              onDone={onClose}
            >
              {children}
            </ReportForm>
          </div>
        </div>
      </div>
    </div>
  );
}
