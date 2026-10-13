'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import LessonReminderForm from './LessonReminderForm';

export default function LessonReminderPrompt() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (
      loading
      || !user?.profile
      || user.profile.lesson_reminders_enabled
      || user.profile.lesson_reminder_prompted_at
    ) {
      setOpen(false);
      return;
    }

    const timer = window.setTimeout(() => setOpen(true), 9000);
    return () => window.clearTimeout(timer);
  }, [
    loading,
    user?.id,
    user?.profile?.lesson_reminders_enabled,
    user?.profile?.lesson_reminder_prompted_at,
  ]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') event.preventDefault();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/60 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-reminder-title"
        aria-describedby="lesson-reminder-description"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
      >
        <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Build a learning habit
        </p>
        <h2 id="lesson-reminder-title" className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">
          Choose your lesson time
        </h2>
        <p id="lesson-reminder-description" className="mb-5 mt-2 text-gray-600 dark:text-gray-300">
          We can send a daily device notification when it&apos;s time to study. You can change or turn off reminders in Settings.
        </p>
        <LessonReminderForm
          prompt
          onDismiss={() => setOpen(false)}
          onSaved={() => setOpen(false)}
        />
      </section>
    </div>
  );
}
