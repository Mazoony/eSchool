'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { updateLessonReminderSettings } from '@/utils/supabase/data';

function decodeVapidKey(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = window.atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export default function LessonReminderForm({
  initialTime = '',
  onSaved,
  onDismiss,
  prompt = false,
  reminderEnabled = false,
}: {
  initialTime?: string;
  onSaved?: () => void;
  onDismiss?: () => void;
  prompt?: boolean;
  reminderEnabled?: boolean;
}) {
  const { user, refreshProfile } = useAuth();
  const [time, setTime] = useState(initialTime.slice(0, 5));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setTime(initialTime.slice(0, 5));
  }, [initialTime]);

  const saveReminder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !time) {
      setError('Choose a time for your daily lesson reminder.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('This browser does not support device notifications. Try an up-to-date browser over HTTPS.');
      }

      let permission = Notification.permission;
      if (permission !== 'granted') permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Allow notifications in your browser to receive lesson reminders.');
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('Device reminders are not configured yet. Contact the eSchool administrator.');
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeVapidKey(vapidPublicKey) as BufferSource,
        });
      }

      const subscriptionResponse = await fetch('/api/lesson-reminders/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });
      const subscriptionResult = await subscriptionResponse.json() as { error?: string };
      if (!subscriptionResponse.ok) {
        throw new Error(subscriptionResult.error || 'Could not register this device for reminders.');
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await updateLessonReminderSettings(user.id, {
        lesson_reminder_time: `${time}:00`,
        lesson_reminder_timezone: timezone,
        lesson_reminders_enabled: true,
        lesson_reminder_prompted_at: new Date().toISOString(),
      });
      await refreshProfile();
      setMessage('Daily lesson reminders are enabled on this device.');
      onSaved?.();
    } catch (saveError: unknown) {
      console.error('Could not enable lesson reminders:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Could not enable lesson reminders.');
    } finally {
      setSaving(false);
    }
  };

  const disableReminder = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateLessonReminderSettings(user.id, {
        lesson_reminder_time: null,
        lesson_reminder_timezone: null,
        lesson_reminders_enabled: false,
      });
      await refreshProfile();
      setTime('');
      setMessage('Daily lesson reminders are turned off.');
      onSaved?.();
    } catch (disableError: unknown) {
      console.error('Could not turn off lesson reminders:', disableError);
      setError(disableError instanceof Error ? disableError.message : 'Could not turn off lesson reminders.');
    } finally {
      setSaving(false);
    }
  };

  const dismissPrompt = async () => {
    if (!user || !onDismiss) return;
    setSaving(true);
    setError(null);
    try {
      await updateLessonReminderSettings(user.id, {
        lesson_reminder_prompted_at: new Date().toISOString(),
      });
      onDismiss();
    } catch (dismissError: unknown) {
      console.error('Could not save lesson reminder prompt status:', dismissError);
      setError(dismissError instanceof Error ? dismissError.message : 'Could not close this reminder prompt.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={saveReminder} className="space-y-4">
      <div>
        <label htmlFor="lesson-reminder-time" className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100">
          Daily reminder time
        </label>
        <input
          id="lesson-reminder-time"
          type="time"
          required
          value={time}
          onChange={(event) => setTime(event.target.value)}
          disabled={saving}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Uses your device&apos;s local time zone. Reminders repeat every day on this device.
        </p>
      </div>
      {error && <p className="text-sm text-red-700 dark:text-red-300" role="alert">{error}</p>}
      {message && <p className="text-sm text-green-700 dark:text-green-300" role="status">{message}</p>}
      <div className="flex flex-wrap justify-end gap-3">
        {prompt && onDismiss && (
          <button
            type="button"
            onClick={() => void dismissPrompt()}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Maybe later
          </button>
        )}
        {reminderEnabled && !prompt && (
          <button
            type="button"
            onClick={() => void disableReminder()}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Turn off
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-wait disabled:opacity-60"
        >
          {saving ? 'Saving…' : reminderEnabled && !prompt ? 'Update reminder' : 'Enable daily reminder'}
        </button>
      </div>
    </form>
  );
}
