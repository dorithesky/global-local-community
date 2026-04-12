"use client";

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

type ThemeToggleProps = {
  compact?: boolean;
};

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-1 text-[var(--text-secondary)] shadow-sm ${compact ? '' : ''}`}>
      {options.map((option) => {
        const Icon = option.icon;
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition ${active ? 'bg-[var(--surface-premium)] text-[var(--text-primary)] shadow-sm' : 'hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'}`}
            aria-pressed={active}
          >
            <Icon className="h-3.5 w-3.5" />
            {!compact ? option.label : null}
          </button>
        );
      })}
    </div>
  );
}
