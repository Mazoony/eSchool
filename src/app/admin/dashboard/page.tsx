'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import DashboardStats from './DashboardStats';
import UserPaymentManagement from './UserPaymentManagement';

const adminEmail = 'wadareaf@gmail.com';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.email === adminEmail;

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    else if (!loading && user && !isAdmin) router.replace('/social');
  }, [loading, user, isAdmin, router]);

  if (loading || !isAdmin) {
    return <p className="p-8 text-center" role="status">Checking administrator access...</p>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <header className="mb-8">
        <p className="font-semibold text-blue-700 dark:text-blue-300">eSchool administration</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-50">Admin dashboard</h1>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          Manage lessons, student tasks, marks, and teacher moderator access.
        </p>
      </header>

      <DashboardStats />
      <UserPaymentManagement />

      <section aria-label="Administrator tools" className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/upload"
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow dark:border-gray-700 dark:bg-gray-800"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Upload a lesson</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            Add lesson videos and learning materials.
          </p>
          <span className="mt-4 inline-block font-semibold text-blue-700 dark:text-blue-300">Open lesson uploader</span>
        </Link>

        <Link
          href="/admin/tasks"
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow dark:border-gray-700 dark:bg-gray-800"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Tasks and moderators</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            Set task prompts and maximum marks, grade submissions, and manage teacher moderators.
          </p>
          <span className="mt-4 inline-block font-semibold text-blue-700 dark:text-blue-300">Review tasks</span>
        </Link>
      </section>
    </main>
  );
}
