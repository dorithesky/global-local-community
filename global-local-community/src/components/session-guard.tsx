"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000;
const WARNING_WINDOW_MS = 2 * 60 * 1000;
const LAST_ACTIVITY_KEY = 'glc-last-activity-at';
const SESSION_STARTED_KEY = 'glc-session-started-at';
const SESSION_EXPIRED_KEY = 'glc-session-expired';

function now() {
  return Date.now();
}

function getInitialExpiredNotice() {
  if (typeof window === 'undefined') return false;
  const expired = window.sessionStorage.getItem(SESSION_EXPIRED_KEY) === '1';
  if (expired) {
    window.sessionStorage.removeItem(SESSION_EXPIRED_KEY);
  }
  return expired;
}

export function SessionGuard() {
  const router = useRouter();
  const timeoutRef = useRef<number | null>(null);
  const warningRef = useRef<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showExpiredNotice, setShowExpiredNotice] = useState(getInitialExpiredNotice);

  useEffect(() => {
    const browserClient = getSupabaseBrowserClient();
    if (!browserClient) return;
    const client = browserClient;

    let cancelled = false;

    async function forceSignOut() {
      if (cancelled) return;
      window.sessionStorage.setItem(SESSION_EXPIRED_KEY, '1');
      await client.auth.signOut();
      window.localStorage.removeItem(LAST_ACTIVITY_KEY);
      window.localStorage.removeItem(SESSION_STARTED_KEY);
      setShowWarning(false);
      router.push('/');
      router.refresh();
    }

    function setActivityTimestamps() {
      const current = String(now());
      if (!window.localStorage.getItem(SESSION_STARTED_KEY)) {
        window.localStorage.setItem(SESSION_STARTED_KEY, current);
      }
      window.localStorage.setItem(LAST_ACTIVITY_KEY, current);
    }

    function clearTimer(ref: React.MutableRefObject<number | null>) {
      if (ref.current) {
        window.clearTimeout(ref.current);
        ref.current = null;
      }
    }

    function clearAllTimers() {
      clearTimer(timeoutRef);
      clearTimer(warningRef);
    }

    function scheduleCheck() {
      clearAllTimers();

      const startedAt = Number(window.localStorage.getItem(SESSION_STARTED_KEY) ?? now());
      const lastActivityAt = Number(window.localStorage.getItem(LAST_ACTIVITY_KEY) ?? now());
      const current = now();
      const idleRemaining = IDLE_TIMEOUT_MS - (current - lastActivityAt);
      const absoluteRemaining = ABSOLUTE_TIMEOUT_MS - (current - startedAt);
      const remaining = Math.min(idleRemaining, absoluteRemaining);

      if (remaining <= 0) {
        void forceSignOut();
        return;
      }

      if (remaining <= WARNING_WINDOW_MS) {
        setShowWarning(true);
      } else {
        warningRef.current = window.setTimeout(() => {
          setShowWarning(true);
        }, remaining - WARNING_WINDOW_MS);
      }

      timeoutRef.current = window.setTimeout(() => {
        void forceSignOut();
      }, remaining);
    }

    function recordActivity() {
      setActivityTimestamps();
      setShowWarning(false);
      scheduleCheck();
    }

    const activityEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'scroll', 'focus'];

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (!session) {
        clearAllTimers();
        window.localStorage.removeItem(LAST_ACTIVITY_KEY);
        window.localStorage.removeItem(SESSION_STARTED_KEY);
        setShowWarning(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        if (!window.localStorage.getItem(SESSION_STARTED_KEY)) {
          window.localStorage.setItem(SESSION_STARTED_KEY, String(now()));
        }
        if (!window.localStorage.getItem(LAST_ACTIVITY_KEY)) {
          window.localStorage.setItem(LAST_ACTIVITY_KEY, String(now()));
        }
        scheduleCheck();
      }
    });

    void client.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      setActivityTimestamps();
      scheduleCheck();
    });

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, recordActivity, { passive: true });
    });

    return () => {
      cancelled = true;
      clearAllTimers();
      subscription.unsubscribe();
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, recordActivity);
      });
    };
  }, [router]);

  return (
    <>
      {showWarning ? (
        <div className="fixed inset-x-4 top-20 z-[110] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-lg sm:left-auto sm:right-6 sm:top-24 sm:w-[26rem]">
          <p className="font-semibold">Session expires soon</p>
          <p className="mt-1 leading-6">You will be signed out soon due to inactivity. Interact with the page to stay signed in.</p>
        </div>
      ) : null}
      {showExpiredNotice ? (
        <div className="fixed inset-x-4 top-20 z-[110] rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-lg sm:left-auto sm:right-6 sm:top-24 sm:w-[28rem]">
          <p className="font-semibold text-slate-900">You were signed out</p>
          <p className="mt-1 leading-6">Your session ended because of inactivity or max session time. Sign in again to continue.</p>
          <button type="button" onClick={() => setShowExpiredNotice(false)} className="mt-3 min-h-10 rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Dismiss</button>
        </div>
      ) : null}
    </>
  );
}
