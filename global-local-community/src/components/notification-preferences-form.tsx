import { saveNotificationPreferencesAction } from '@/app/settings/actions';

const options = [
  { name: 'notifyLikes', label: 'Get Likes' },
  { name: 'notifyComments', label: 'Get Comments' },
  { name: 'marketingEmails', label: 'Marketing Emails' },
] as const;

export function NotificationPreferencesForm() {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <form action={saveNotificationPreferencesAction} className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Notify if:</p>
        </div>
        <div className="space-y-3">
          {options.map((option) => (
            <label key={option.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-800">
              <span>{option.label}</span>
              <input type="checkbox" name={option.name} defaultChecked className="h-4 w-4" />
            </label>
          ))}
        </div>
        <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
          Save preferences
        </button>
      </form>
    </section>
  );
}
