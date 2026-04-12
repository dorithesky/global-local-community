import { saveConsentSettingsAction, saveNotificationPreferencesAction, saveProfileIdentityAction } from '@/app/settings/actions';

export function AccountSettingsForm({
  settings,
}: {
  settings: {
    profile: { displayName: string; bio: string; city: string; originCountry: string; lifeStage: string; immediateNeed: string };
    notifications: { notifyLikes: boolean; notifyComments: boolean };
    consent: { marketingConsent: boolean; thirdPartyEmailConsent: boolean };
  };
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <form action={saveProfileIdentityAction} className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Public profile</p>
            <p className="mt-1 text-sm text-slate-500">Change the name and profile details people see in the community.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">Display name</label>
              <input name="displayName" defaultValue={settings.profile.displayName} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-sky-200 focus:ring" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">City</label>
              <input name="city" defaultValue={settings.profile.city} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-sky-200 focus:ring" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">Origin country</label>
              <input name="originCountry" defaultValue={settings.profile.originCountry} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-sky-200 focus:ring" placeholder="Canada, India, UK" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-900">Life stage or visa context</label>
              <input name="lifeStage" defaultValue={settings.profile.lifeStage} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-sky-200 focus:ring" placeholder="Student, teacher, job seeker, spouse visa" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">Bio</label>
            <textarea name="bio" defaultValue={settings.profile.bio} className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-sky-200 focus:ring" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">What do you need most right now?</label>
            <select name="immediateNeed" defaultValue={settings.profile.immediateNeed} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-sky-200 focus:ring">
              <option value="">Choose one</option>
              <option value="housing">Housing</option>
              <option value="jobs">Jobs</option>
              <option value="daily-life">Daily life</option>
              <option value="events">Events</option>
              <option value="marketplace">Marketplace</option>
            </select>
            <p className="mt-2 text-xs leading-6 text-slate-500">This helps shape the first posts and recommendations you should see.</p>
          </div>
          <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
            Save profile
          </button>
        </form>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <form action={saveNotificationPreferencesAction} className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <p className="mt-1 text-sm text-slate-500">Choose the activity updates you want to receive.</p>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-800">
              <span>Get Likes</span>
              <input type="checkbox" name="notifyLikes" defaultChecked={settings.notifications.notifyLikes} className="h-4 w-4" />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-800">
              <span>Get Comments</span>
              <input type="checkbox" name="notifyComments" defaultChecked={settings.notifications.notifyComments} className="h-4 w-4" />
            </label>
          </div>
          <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
            Save notification settings
          </button>
        </form>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <form action={saveConsentSettingsAction} className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Marketing and data consent</p>
            <p className="mt-1 text-sm text-slate-500">Separate consent for marketing communication and approved third-party delivery tools.</p>
          </div>
          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            <span>
              <span className="block font-medium text-slate-900">I agree to receive marketing information</span>
              <span className="mt-1 block text-slate-500">Includes product updates, launches, and community announcements.</span>
            </span>
            <input type="checkbox" name="marketingConsent" defaultChecked={settings.consent.marketingConsent} className="mt-1 h-4 w-4" />
          </label>
          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            <span>
              <span className="block font-medium text-slate-900">I allow approved third-party providers to help deliver those emails</span>
              <span className="mt-1 block text-slate-500">Used only for sending the communication you agreed to receive.</span>
            </span>
            <input type="checkbox" name="thirdPartyEmailConsent" defaultChecked={settings.consent.thirdPartyEmailConsent} className="mt-1 h-4 w-4" />
          </label>
          <button type="submit" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
            Save consent settings
          </button>
          <p className="text-xs leading-6 text-slate-500">If you need stricter compliance handling later, this should move into a dedicated consent table with audit timestamps.</p>
        </form>
      </section>
    </div>
  );
}
