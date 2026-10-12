'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { getLessons, Lesson } from './actions';
import { GradeId, getGrade } from './curriculum';
import { useAuth } from '../AuthContext';
import { getCompletedLessonIds } from '@/utils/supabase/lessonTasks';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import ExpandableText from '../components/ExpandableText';

export default function ClassLessonsClient({
  gradeId,
  classNumber,
}: {
  gradeId: GradeId;
  classNumber: number;
}) {
  const grade = getGrade(gradeId);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    let active = true;
    getLessons(gradeId, classNumber)
      .then(async (results) => {
        const completedIds = await getCompletedLessonIds(
          results.map((lesson) => lesson.id),
          user.id,
        );
        if (active) {
          setLessons(results);
          setCompletedLessonIds(completedIds);
        }
      })
      .catch((loadError: unknown) => {
        console.error('Failed to load class lessons:', loadError);
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load lessons.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [gradeId, classNumber, authLoading, user]);

  if (authLoading || !user) {
    return <p className="p-8 text-center text-gray-600 dark:text-gray-300">Checking your sign-in...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link
          href="/lessons"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300 dark:hover:bg-gray-800"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          All grades
        </Link>
        <div className="mb-8 mt-6">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">{grade?.title}</p>
          <h1 className="mt-2 text-4xl font-black text-gray-950 dark:text-white">Class {classNumber} lessons</h1>
        </div>

        {loading ? (
          <p className="py-12 text-center text-gray-500">Loading lessons...</p>
        ) : error ? (
          <p className="rounded-xl bg-red-50 p-5 text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">{error}</p>
        ) : lessons.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-gray-700 dark:bg-gray-900">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">No lessons here yet</h2>
            <p className="mx-auto mt-2 max-w-md text-gray-600 dark:text-gray-400">
              Lessons assigned to {grade?.title}, Class {classNumber} will appear here when they are uploaded.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              return (
                <article
                  key={lesson.id}
                  className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${grade?.accent} text-white`}>
                      <BookOpenIcon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-300">
                        <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                        Completed
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/lessons/${lesson.slug}`}
                    className="mt-5 block text-xl font-bold text-gray-900 hover:text-blue-700 dark:text-white dark:hover:text-blue-300"
                  >
                    {lesson.title}
                  </Link>
                  <ExpandableText
                    text={lesson.description}
                    collapsedLines={3}
                    className="mt-2 text-gray-600 dark:text-gray-300"
                  />
                  <Link
                    href={`/lessons/${lesson.slug}`}
                    className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300"
                  >
                    Open lesson
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
