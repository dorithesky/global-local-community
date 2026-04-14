"use client";

import { useActionState } from 'react';
import { INITIAL_SETTINGS_ACTION_STATE, saveNotificationPreferencesAction } from '@/app/settings/actions';

const options = [
  { name: 'notifyLikes', label: 'Get Likes' },
  { name: 'notifyComments', label: 'Get Comments' },
  { name: 'marketingEmails', label: 'Marketing Emails' },
] as const;

export function NotificationPreferencesForm() {
  const [state, action] = useActionState(saveNotificationPreferencesAction, INITIAL_SETTINGS_ACTION_STATE);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <form action={action} className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Settings</p>
          <p className="mt-1 text-sm text-slate-600">Choose which updates and emails you want to receive.</p>
        </div>
        <div className="space-y-3">
          {options.map((option) => (
            <label key={option.name} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-800">
              <span>{option.label}</span>
              <input type="checkbox" name={option.name} defaultChecked className="h-4 w-4" />
            </label>
          ))}
        </div>
        <button type="submit" className="min-h-11 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
          Save preferences
        </button>
        {state.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      </form>
    </section>
  );
}
