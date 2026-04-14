"use client";

import { useState } from 'react';
import Link from 'next/link';

type SettingsMessage = { error: string | null; success: string | null };

function AccentSubmitButton({ label, pending }: { label: string; pending: boolean }) {
  return <button type="submit" disabled={pending} className="min-h-11 rounded-full bg-[var(--accent-primary)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--accent-primary-strong)] disabled:opacity-60">{pending ? 'Saving...' : label}</button>;
}

function FormFeedback({ error, success }: SettingsMessage) {
  return (
    <>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
    </>
  );
}

export function AccountSettingsForm({
  settings,
}: {
  settings: {
    profile: { displayName: string; bio: string; city: string; occupation: string; originCountry: string; lifeStage: string; immediateNeed: string };
    notifications: { notifyLikes: boolean; notifyComments: boolean };
    consent: { marketingConsent: boolean; thirdPartyEmailConsent: boolean };
  };
}) {
  const [profileState, setProfileState] = useState<SettingsMessage>({ error: null, success: null });
  const [notificationState, setNotificationState] = useState<SettingsMessage>({ error: null, success: null });
  const [consentState, setConsentState] = useState<SettingsMessage>({ error: null, success: null });
  const [pending, setPending] = useState<'profile' | 'notifications' | 'consent' | null>(null);

  async function submitJson(endpoint: string, payload: unknown) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Save failed.');
    }
    return data as { ok: true; message: string };
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-6">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setPending('profile');
            setProfileState({ error: null, success: null });
            const form = event.currentTarget;
            const formData = new FormData(form);
            try {
              const result = await submitJson('/api/settings/profile', {
                displayName: formData.get('displayName'),
                city: formData.get('city'),
                occupation: formData.get('occupation'),
                originCountry: formData.get('originCountry'),
                lifeStage: formData.get('lifeStage'),
                bio: formData.get('bio'),
                immediateNeed: formData.get('immediateNeed'),
              });
              setProfileState({ error: null, success: result.message });
            } catch (error) {
              setProfileState({ error: error instanceof Error ? error.message : 'Could not save your profile.', success: null });
            } finally {
              setPending(null);
            }
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Public profile</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-tertiary)]">Change the identity details people see in the community.</p>
            </div>
            <Link href="#account-controls" className="text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary-strong)]">Jump to account controls</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Display name</label>
              <input name="displayName" defaultValue={settings.profile.displayName} className="min-h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none ring-[var(--border-strong)] focus:ring" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">City</label>
              <input name="city" defaultValue={settings.profile.city} className="min-h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none ring-[var(--border-strong)] focus:ring" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Occupation</label>
              <input name="occupation" defaultValue={settings.profile.occupation} className="min-h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none ring-[var(--border-strong)] focus:ring" placeholder="Teacher, designer, student" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Origin country</label>
              <input name="originCountry" defaultValue={settings.profile.originCountry} className="min-h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none ring-[var(--border-strong)] focus:ring" placeholder="Canada, India, UK" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Life stage or visa context</label>
              <input name="lifeStage" defaultValue={settings.profile.lifeStage} className="min-h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none ring-[var(--border-strong)] focus:ring" placeholder="Student, teacher, job seeker, spouse visa" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">Bio</label>
            <textarea name="bio" defaultValue={settings.profile.bio} className="min-h-28 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-sm leading-6 text-[var(--text-primary)] outline-none ring-[var(--border-strong)] focus:ring" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">What do you need most right now?</label>
            <select name="immediateNeed" defaultValue={settings.profile.immediateNeed} className="min-h-11 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none ring-[var(--border-strong)] focus:ring">
              <option value="">Choose one</option>
              <option value="housing">Housing</option>
              <option value="jobs">Jobs</option>
              <option value="daily-life">Daily life</option>
              <option value="events">Events</option>
              <option value="marketplace">Marketplace</option>
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--text-tertiary)] sm:leading-6">This helps shape the first posts and recommendations you should see.</p>
          </div>
          <AccentSubmitButton label="Save profile" pending={pending === 'profile'} />
          <FormFeedback error={profileState.error} success={profileState.success} />
        </form>
      </section>

      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-6">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setPending('notifications');
            setNotificationState({ error: null, success: null });
            const formData = new FormData(event.currentTarget);
            try {
              const result = await submitJson('/api/settings/notifications', {
                notifyLikes: formData.get('notifyLikes') === 'on',
                notifyComments: formData.get('notifyComments') === 'on',
              });
              setNotificationState({ error: null, success: result.message });
            } catch (error) {
              setNotificationState({ error: error instanceof Error ? error.message : 'Could not save notification settings.', success: null });
            } finally {
              setPending(null);
            }
          }}
        >
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Notifications</p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-tertiary)]">Choose the activity updates you want to receive.</p>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-4 text-sm font-medium text-[var(--text-primary)]">
              <span>Get Likes</span>
              <input type="checkbox" name="notifyLikes" defaultChecked={settings.notifications.notifyLikes} className="h-4 w-4 shrink-0" />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-4 text-sm font-medium text-[var(--text-primary)]">
              <span>Get Comments</span>
              <input type="checkbox" name="notifyComments" defaultChecked={settings.notifications.notifyComments} className="h-4 w-4 shrink-0" />
            </label>
          </div>
          <AccentSubmitButton label="Save notification settings" pending={pending === 'notifications'} />
          <FormFeedback error={notificationState.error} success={notificationState.success} />
        </form>
      </section>

      <section id="account-controls" className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-sm sm:p-6">
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setPending('consent');
            setConsentState({ error: null, success: null });
            const formData = new FormData(event.currentTarget);
            try {
              const result = await submitJson('/api/settings/consent', {
                marketingConsent: formData.get('marketingConsent') === 'on',
                thirdPartyEmailConsent: formData.get('thirdPartyEmailConsent') === 'on',
              });
              setConsentState({ error: null, success: result.message });
            } catch (error) {
              setConsentState({ error: error instanceof Error ? error.message : 'Could not save consent settings.', success: null });
            } finally {
              setPending(null);
            }
          }}
        >
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Marketing and data consent</p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-tertiary)]">Separate consent for marketing communication and approved third-party delivery tools.</p>
          </div>
          <label className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-4 text-sm text-[var(--text-secondary)]">
            <span>
              <span className="block font-medium text-[var(--text-primary)]">I agree to receive marketing information</span>
              <span className="mt-1 block leading-6 text-[var(--text-tertiary)]">Includes product updates, launches, and community announcements.</span>
            </span>
            <input type="checkbox" name="marketingConsent" defaultChecked={settings.consent.marketingConsent} className="mt-1 h-4 w-4 shrink-0" />
          </label>
          <label className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] px-4 py-4 text-sm text-[var(--text-secondary)]">
            <span>
              <span className="block font-medium text-[var(--text-primary)]">I allow approved third-party providers to help deliver those emails</span>
              <span className="mt-1 block leading-6 text-[var(--text-tertiary)]">Used only for sending the communication you agreed to receive.</span>
            </span>
            <input type="checkbox" name="thirdPartyEmailConsent" defaultChecked={settings.consent.thirdPartyEmailConsent} className="mt-1 h-4 w-4 shrink-0" />
          </label>
          <button type="submit" disabled={pending === 'consent'} className="min-h-11 rounded-full bg-[var(--text-primary)] px-5 py-3 text-sm font-medium text-[var(--surface-primary)] hover:opacity-90 disabled:opacity-60">
            {pending === 'consent' ? 'Saving...' : 'Save consent settings'}
          </button>
          <FormFeedback error={consentState.error} success={consentState.success} />
          <p className="text-xs leading-5 text-[var(--text-tertiary)] sm:leading-6">If you need stricter compliance handling later, this should move into a dedicated consent table with audit timestamps.</p>
        </form>
      </section>
    </div>
  );
}
