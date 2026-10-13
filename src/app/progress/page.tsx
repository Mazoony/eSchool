'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import { getGrade } from '@/app/lessons/curriculum';
import { createClient } from '@/utils/supabase/client';
import { getStudentProgress, StudentProgressLesson } from '@/utils/supabase/lessonTasks';

interface ProgressGroup {
  key: string;
  label: string;
  lessons: StudentProgressLesson[];
  earned: number;
  possible: number;
  percentage: number | null;
}

function getGroupLabel(lesson: StudentProgressLesson): string {
  const grade = lesson.grade ? getGrade(lesson.grade) : null;
  if (!grade) return 'Other lessons';
  return lesson.class_number === null
    ? grade.title
    : `${grade.title} · Class ${lesson.class_number}`;
}

function getGradingLabel(
  status: StudentProgressLesson['grading_status'],
  hasScore: boolean,
): string {
  switch (status) {
    case 'ai_graded':
      return 'AI graded';
    case 'teacher_reviewed':
      return 'Teacher reviewed';
    case 'needs_review':
      return 'Waiting for teacher review';
    case 'grading':
      return 'Being graded';
    case 'grading_failed':
      return 'Waiting for teacher review';
    case 'pending':
      return hasScore ? 'Marked' : 'Awaiting mark';
  }
}

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [lessons, setLessons] = useState<StudentProgressLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveUpdateError, setLiveUpdateError] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  const refreshProgress = useCallback(async () => {
    if (!user) return;
    try {
      const results = await getStudentProgress(user.id);
      setLessons(results);
      setError(null);
    } catch (loadError: unknown) {
      console.error('Could not load student progress:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Could not load your progress.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    let refreshTimer: number | undefined;
    const refreshIfActive = () => {
      if (!active) return;
      void refreshProgress();
    };
    refreshIfActive();

    const client = createClient();
    const channel = client
      .channel(`student-progress:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lesson_submissions',
          filter: `student_id=eq.${user.id}`,
        },
        () => {
          window.clearTimeout(refreshTimer);
          refreshTimer = window.setTimeout(refreshIfActive, 200);
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons' },
        () => {
          window.clearTimeout(refreshTimer);
          refreshTimer = window.setTimeout(refreshIfActive, 200);
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setLiveUpdateError(true);
        if (status === 'SUBSCRIBED') setLiveUpdateError(false);
      });

    return () => {
      active = false;
      window.clearTimeout(refreshTimer);
      void client.removeChannel(channel);
    };
  }, [user, refreshProgress]);

  const groups = useMemo(() => {
    const grouped = new Map<string, ProgressGroup>();
    for (const lesson of lessons) {
      const key = `${lesson.grade ?? 'other'}:${lesson.class_number ?? 'foundation'}`;
      const group = grouped.get(key) ?? {
        key,
        label: getGroupLabel(lesson),
        lessons: [],
        earned: 0,
        possible: 0,
        percentage: null,
      };
      group.lessons.push(lesson);
      if (lesson.score !== null) {
        group.earned += lesson.score;
        group.possible += lesson.max_score;
      }
      grouped.set(key, group);
    }

    return [...grouped.values()].map((group) => ({
      ...group,
      percentage: group.possible > 0 ? (group.earned / group.possible) * 100 : null,
    }));
  }, [lessons]);

  const summary = useMemo(() => {
    const gradedLessons = lessons.filter((lesson) => lesson.score !== null);
    const earned = gradedLessons.reduce((total, lesson) => total + (lesson.score ?? 0), 0);
    const possible = gradedLessons.reduce((total, lesson) => total + lesson.max_score, 0);
    return {
      earned,
      possible,
      percentage: possible > 0 ? (earned / possible) * 100 : null,
      completed: lessons.length,
      graded: gradedLessons.length,
      awaiting: lessons.length - gradedLessons.length,
    };
  }, [lessons]);

  if (authLoading || !user) {
    return <p className="p-8 text-center text-gray-600 dark:text-gray-300" role="status">Checking your sign-in...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Your learning journey
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-gray-950 dark:text-white">My Progress</h1>
          <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-300">
            Your score updates when you submit a lesson and whenever a mark is awarded or changed.
          </p>
        </header>

        {error && (
          <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
            {error}
          </p>
        )}
        {liveUpdateError && (
          <p className="mb-5 rounded-xl bg-amber-50 p-4 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200" role="status">
            Live updates are temporarily unavailable. Refresh this page to see the latest marks.
          </p>
        )}

        {loading ? (
          <p className="rounded-2xl bg-white p-8 text-center text-gray-600 shadow dark:bg-gray-900 dark:text-gray-300" role="status">
            Loading your progress...
          </p>
        ) : error ? null : lessons.length === 0 ? (
          <section className="rounded-2xl bg-white p-8 text-center shadow dark:bg-gray-900">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your progress starts with your first lesson</h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-gray-300">
              Submit a lesson task to see your scores here. Lessons and marks are added automatically as they become available.
            </p>
            <Link href="/lessons" className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
              Browse lessons
            </Link>
          </section>
        ) : (
          <>
            <section aria-label="Overall score" className="rounded-2xl bg-white p-6 shadow ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Overall score · graded lessons
                  </p>
                  <p className="mt-2 text-5xl font-black text-blue-700 dark:text-blue-300">
                    {summary.percentage === null ? '—' : `${summary.percentage.toFixed(1)}%`}
                  </p>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {summary.percentage === null
                      ? 'Your submitted work is waiting to be marked.'
                      : `${summary.earned.toFixed(2)} points earned out of ${summary.possible.toFixed(2)} possible`}
                  </p>
                  {summary.percentage !== null && (
                    <div
                      className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                      role="progressbar"
                      aria-label="Overall score percentage"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.min(100, summary.percentage)}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all"
                        style={{ width: `${Math.min(100, summary.percentage)}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3 sm:w-72">
                  <div className="rounded-xl bg-blue-50 p-3 text-center dark:bg-blue-950/40">
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{summary.completed}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Submitted</p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-3 text-center dark:bg-green-950/40">
                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">{summary.graded}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Marked</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3 text-center dark:bg-amber-950/40">
                    <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">{summary.awaiting}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Awaiting</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-8" aria-labelledby="class-progress-heading">
              <h2 id="class-progress-heading" className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Progress by class
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {groups.map((group) => (
                  <article key={group.key} className="rounded-2xl bg-white p-5 shadow ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{group.label}</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {group.lessons.length} submitted {group.lessons.length === 1 ? 'lesson' : 'lessons'}
                        </p>
                      </div>
                      <span className="text-lg font-extrabold text-blue-700 dark:text-blue-300">
                        {group.percentage === null ? '—' : `${group.percentage.toFixed(1)}%`}
                      </span>
                    </div>
                    {group.percentage !== null ? (
                      <>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${Math.min(100, group.percentage)}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {group.earned.toFixed(2)} / {group.possible.toFixed(2)} points across marked lessons
                        </p>
                      </>
                    ) : (
                      <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">Marks are still pending.</p>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-8" aria-labelledby="lesson-results-heading">
              <h2 id="lesson-results-heading" className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Lesson results
              </h2>
              <ol className="divide-y divide-gray-200 overflow-hidden rounded-2xl bg-white shadow ring-1 ring-gray-200 dark:divide-gray-800 dark:bg-gray-900 dark:ring-gray-800">
                {lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link href={`/lessons/${lesson.id}`} className="flex flex-col gap-2 p-4 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:hover:bg-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-gray-900 dark:text-white">{lesson.title}</span>
                        <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                          {getGroupLabel(lesson)} · {getGradingLabel(lesson.grading_status, lesson.score !== null)}
                        </span>
                      </span>
                      <span className="shrink-0 font-bold text-gray-900 dark:text-white">
                        {lesson.score === null
                          ? 'Awaiting mark'
                          : `${lesson.score.toFixed(2)} / ${lesson.max_score.toFixed(2)} (${((lesson.score / lesson.max_score) * 100).toFixed(1)}%)`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
