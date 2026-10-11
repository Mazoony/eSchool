'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { getLeaderboard, LeaderboardEntry } from '@/utils/supabase/lessonTasks';
import PaidBadge from '@/app/components/PaidBadge';
import SocialShare from '@/app/components/SocialShare';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLeaderboard = useCallback(async () => {
    try {
      const results = await getLeaderboard();
      setEntries(results);
      setError(null);
    } catch (loadError: unknown) {
      console.error('Could not load the leaderboard:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Could not load the leaderboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshLeaderboard();

    const client = createClient();
    const channel = client
      .channel('public-leaderboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leaderboard' },
        () => void refreshLeaderboard(),
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setError('Live leaderboard updates are unavailable. Try refreshing the page.');
        }
      });

    return () => {
      void client.removeChannel(channel);
    };
  }, [refreshLeaderboard]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <header className="mb-8 text-center">
        <p className="font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Learn together, grow together
        </p>
        <h1 className="mt-2 text-4xl font-extrabold text-gray-900 dark:text-gray-50">Leaderboard</h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600 dark:text-gray-300">
          Rankings use each student’s average percentage across graded tasks and update as marks are awarded.
        </p>
      </header>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="rounded-lg bg-white p-6 text-center shadow dark:bg-gray-800" role="status">
          Loading rankings...
        </p>
      ) : entries.length === 0 ? (
        <section className="rounded-xl bg-white p-8 text-center shadow dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">The rankings are waiting to begin</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Students appear here after their first task is marked.
          </p>
          <Link href="/lessons" className="mt-5 inline-block rounded-md bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700">
            Explore lessons
          </Link>
        </section>
      ) : (
        <ol className="space-y-3" aria-label="Student rankings">
          {entries.map((entry) => {
            const name = entry.student.full_name
              || (entry.student.username ? `@${entry.student.username}` : 'Student');
            const isCurrentUser = entry.student_id === user?.id;

            return (
              <li
                key={entry.student_id}
                className={`flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800 ${
                  isCurrentUser
                    ? 'border-blue-400 ring-2 ring-blue-200 dark:border-blue-500 dark:ring-blue-900'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  aria-label={`Rank ${entry.rank}`}
                >
                  {entry.rank}
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Image
                    src={entry.student.avatar_url || '/user.svg'}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <span className="min-w-0">
                    {user ? (
                      <Link href={`/profile/${entry.student_id}`} className="inline-flex max-w-full items-center gap-1 truncate font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-50 dark:hover:text-blue-400">
                        {name}
                        <PaidBadge isPaid={entry.student.is_paid} />
                      </Link>
                    ) : (
                      <span className="inline-flex max-w-full items-center gap-1 truncate font-semibold text-gray-900 dark:text-gray-50">
                        {name}
                        <PaidBadge isPaid={entry.student.is_paid} />
                      </span>
                    )}
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      {entry.graded_tasks} {entry.graded_tasks === 1 ? 'task' : 'tasks'} graded
                      {isCurrentUser ? ' · You' : ''}
                    </span>
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-right">
                    <span className="block text-xl font-bold text-gray-900 dark:text-gray-50">
                      {entry.average_percentage.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">average</span>
                  </span>
                  {isCurrentUser && (
                    <SocialShare
                      href={`/register?ref=leaderboard&student=${encodeURIComponent(entry.student_id)}`}
                      title="My eSchool leaderboard result"
                      text={`I'm ranked #${entry.rank} on the eSchool leaderboard with a ${entry.average_percentage.toFixed(1)}% average across ${entry.graded_tasks} graded ${entry.graded_tasks === 1 ? 'task' : 'tasks'}! Join me and start learning English:`}
                      label="Share success"
                      className="justify-end"
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
