'use client';

import { useAuth } from '../AuthContext';
import LessonReminderForm from './LessonReminderForm';

export default function LessonReminderSettings() {
  const { user, loading } = useAuth();
  if (loading) return <p role="status">Loading reminder settings…</p>;
  if (!user) return <p>Sign in to manage lesson reminders.</p>;

  const profile = user.profile;
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daily lesson reminders</h2>
      <p className="mb-5 mt-2 text-gray-600 dark:text-gray-300">
        Get a device notification each day at your chosen local time.
      </p>
      <LessonReminderForm
        initialTime={profile?.lesson_reminder_time ?? ''}
        reminderEnabled={profile?.lesson_reminders_enabled === true}
      />
    </section>
  );
}
