import { SessionPill } from '@/components/session-pill';
import { SignOutButton } from '@/components/sign-out-button';
import { getCurrentMember } from '@/lib/auth';

export async function TopAuthBar() {
  const member = await getCurrentMember();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {member ? 'You are signed in and ready to post.' : 'Sign in to post, comment, bookmark, and report.'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {member ? 'Your profile is live in the app now.' : 'Use Google or email. Keep it friction-light.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SessionPill />
          {member ? <SignOutButton /> : null}
        </div>
      </div>
    </div>
  );
}
