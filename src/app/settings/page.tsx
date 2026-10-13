import Link from 'next/link';
import LessonReminderSettings from '../components/LessonReminderSettings';

export default function Settings() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-6 py-8">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Manage your learning and notification preferences.</p>
      </header>
      <LessonReminderSettings />
      <div className="flex flex-wrap gap-4 text-sm font-semibold">
        <Link href="/lessons" className="text-blue-700 hover:underline dark:text-blue-300">Lessons</Link>
        <Link href="/social" className="text-blue-700 hover:underline dark:text-blue-300">Social</Link>
      </div>
    </main>
  );
}
