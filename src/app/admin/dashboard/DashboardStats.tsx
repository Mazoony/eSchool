'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getUserCount } from '@/utils/supabase/data';

interface DashboardStatsData {
  users: number;
  femaleUsers: number;
  maleUsers: number;
  unrecordedGenderUsers: number;
  lessons: number;
  submissions: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = createClient();
      const [
        users,
        femaleUsersResult,
        maleUsersResult,
        lessonsResult,
        submissionsResult,
      ] = await Promise.all([
        getUserCount(),
        client.from('private_signup_details').select('user_id', { count: 'exact', head: true }).eq('gender', 'female'),
        client.from('private_signup_details').select('user_id', { count: 'exact', head: true }).eq('gender', 'male'),
        client.from('lessons').select('id', { count: 'exact', head: true }),
        client.from('lesson_submissions').select('id', { count: 'exact', head: true }),
      ]);
      const failedResult = [
        femaleUsersResult,
        maleUsersResult,
        lessonsResult,
        submissionsResult,
      ].find((result) => result.error);
      if (failedResult?.error) throw new Error(failedResult.error.message);

      const femaleUsers = femaleUsersResult.count ?? 0;
      const maleUsers = maleUsersResult.count ?? 0;
      setStats({
        users,
        femaleUsers,
        maleUsers,
        unrecordedGenderUsers: Math.max(0, users - femaleUsers - maleUsers),
        lessons: lessonsResult.count ?? 0,
        submissions: submissionsResult.count ?? 0,
      });
    } catch (loadError: unknown) {
      console.error('Could not load admin dashboard statistics:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Could not load dashboard statistics.');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    const client = createClient();
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        refreshTimeout = null;
        void loadStats();
      }, 200);
    };
    const channel = client
      .channel('admin-dashboard-statistics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'private_signup_details' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lesson_submissions' }, scheduleRefresh)
      .subscribe((status, channelError) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          const message = channelError?.message ?? `Realtime subscription failed: ${status}`;
          console.error('Could not subscribe to admin dashboard statistics:', message);
          setError(`Live updates unavailable: ${message}`);
        }
      });

    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      void client.removeChannel(channel);
    };
  }, [loadStats]);

  const cards: { label: string; value: number | undefined }[] = [
    { label: 'Registered users', value: stats?.users },
    { label: 'Female users', value: stats?.femaleUsers },
    { label: 'Male users', value: stats?.maleUsers },
    { label: 'Gender not recorded', value: stats?.unrecordedGenderUsers },
    { label: 'Lessons', value: stats?.lessons },
    { label: 'Task submissions', value: stats?.submissions },
  ];

  return (
    <section aria-labelledby="dashboard-statistics-heading" className="mb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="dashboard-statistics-heading" className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Platform statistics
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Counts from the eSchool database.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadStats()}
          disabled={loading}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
        >
          {loading ? 'Loading...' : 'Refresh statistics'}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200" role="alert">
          {error}
        </p>
      )}

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy={loading}>
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <dt className="text-sm font-semibold text-gray-700 dark:text-gray-300">{card.label}</dt>
            <dd className="mt-2 text-3xl font-extrabold text-blue-700 dark:text-blue-300">
              {stats ? card.value?.toLocaleString() : loading ? '—' : 'Unavailable'}
            </dd>
          </div>
        ))}
      </dl>
      {loading && <p className="sr-only" role="status">Loading platform statistics...</p>}
    </section>
  );
}
