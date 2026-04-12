import { saveNotificationPreferencesAction } from '@/app/settings/actions';

export function NotificationPreferencesForm() {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <form action={saveNotificationPreferencesAction} className="space-y-4">
        <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
          <span>
            <span className="block font-medium text-slate-900">Notify me when my posts get likes</span>
            <span className="mt-1 block text-slate-500">A lightweight activity signal for traction and appreciation.</span>
          </span>
          <input type="checkbox" name="notifyLikes" className="h-4 w-4" />
        </label>
        <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
          <span>
            <span className="block font-medium text-slate-900">Notify me when my posts get comments</span>
            <span className="mt-1 block text-slate-500">Useful when someone answers a housing, job, or life question.</span>
          </span>
          <input type="checkbox" name="notifyComments" className="h-4 w-4" />
        </label>
        <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
          Save preferences
        </button>
      </form>
    </section>
  );
}
