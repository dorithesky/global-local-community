"use client";

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

type ThemeToggleProps = {
  compact?: boolean;
};

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, mounted, setTheme } = useTheme();

  const wrapperClass = compact
    ? 'inline-flex max-w-full items-center gap-0 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-0.5 text-[var(--text-secondary)] shadow-sm'
    : 'inline-flex max-w-full items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-1 text-[var(--text-secondary)] shadow-sm';

  const buttonClass = compact
    ? 'inline-flex min-h-8 min-w-8 items-center justify-center rounded-full px-1.5 py-1.5 text-xs font-medium transition'
    : 'inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition';

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className={wrapperClass}>
      {options.map((option) => {
        const Icon = option.icon;
        const active = mounted ? theme === option.value : option.value === 'system';
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={`${buttonClass} ${active ? 'bg-[var(--surface-premium)] text-[var(--text-primary)] shadow-sm' : 'hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'}`}
            aria-pressed={active}
            suppressHydrationWarning
          >
            <Icon className={`${compact ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5'}`} />
            {!compact ? option.label : null}
          </button>
        );
      })}
    </div>
  );
}
