'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, BookOpenIcon, PlayIcon } from '@heroicons/react/24/outline';
import { getClassLessons, getSignedLessonVideoUrl, Lesson } from './actions';
import { GradeId, getGrade } from './curriculum';
import { useAuth } from '../AuthContext';
import { getCompletedLessonIds } from '@/utils/supabase/lessonTasks';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import ExpandableText from '../components/ExpandableText';
import LessonDetails from './[id]/LessonDetails';

function getLastLessonStorageKey(userId: string, gradeId: GradeId, classNumber?: number): string {
  return `eschool:last-lesson:${userId}:${gradeId}:${classNumber ?? 'foundation'}`;
}

const lessonCacheMaxAgeMs = 5 * 60 * 1000;

function getLessonCacheKey(gradeId: GradeId, classNumber?: number): string {
  return `eschool:lesson-metadata:v1:${gradeId}:${classNumber ?? 'foundation'}`;
}

function isLesson(value: unknown): value is Lesson {
  if (!value || typeof value !== 'object') return false;
  const lesson = value as Record<string, unknown>;
  return typeof lesson.id === 'string'
    && typeof lesson.title === 'string'
    && typeof lesson.description === 'string'
    && typeof lesson.video_url === 'string'
    && typeof lesson.created_at === 'string'
    && typeof lesson.slug === 'string'
    && (lesson.grade === null || typeof lesson.grade === 'string')
    && (lesson.class_number === null || typeof lesson.class_number === 'number')
    && typeof lesson.display_order === 'number'
    && (lesson.task_prompt === null || typeof lesson.task_prompt === 'string')
    && typeof lesson.task_max_score === 'number';
}

function readCachedLessons(gradeId: GradeId, classNumber?: number): Lesson[] | null {
  const cachedValue = window.localStorage.getItem(getLessonCacheKey(gradeId, classNumber));
  if (!cachedValue) return null;
  const parsed: unknown = JSON.parse(cachedValue);
  if (!parsed || typeof parsed !== 'object') return null;
  const cache = parsed as { savedAt?: unknown; lessons?: unknown };
  if (typeof cache.savedAt !== 'number' || !Array.isArray(cache.lessons)) return null;
  if (Date.now() - cache.savedAt > lessonCacheMaxAgeMs) return null;
  return cache.lessons.every(isLesson) ? cache.lessons : null;
}

export default function ClassLessonsClient({
  gradeId,
  classNumber,
}: {
  gradeId: GradeId;
  classNumber?: number;
}) {
  const grade = getGrade(gradeId);
  const isFoundation = gradeId === 'english-foundation';
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
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
    let cachedLessons: Lesson[] | null = null;

    try {
      cachedLessons = readCachedLessons(gradeId, classNumber);
      if (cachedLessons) {
        setLessons(cachedLessons);
        setLoading(false);
        const lastLessonId = window.localStorage.getItem(
          getLastLessonStorageKey(user.id, gradeId, classNumber),
        );
        const savedLesson = cachedLessons.find((lesson) => lesson.id === lastLessonId);
        setSelectedLessonId((savedLesson ?? cachedLessons[0])?.id ?? null);
      }
    } catch (storageError: unknown) {
      console.error('Could not read cached class lessons:', storageError);
      setProgressError('Saved lesson data could not be read. The latest lessons will still load from the server.');
    }

    const cachedCompletionPromise = cachedLessons
      ? getCompletedLessonIds(cachedLessons.map((lesson) => lesson.id), user.id)
        .then((ids) => ({ ids, error: null as unknown }))
        .catch((completionError: unknown) => ({ ids: null, error: completionError }))
      : Promise.resolve(null);

    const loadLessons = async () => {
      let freshLessonsLoaded = false;
      try {
        const results = await getClassLessons(gradeId, classNumber);
        if (!active) return;

        setLessons(results);
        freshLessonsLoaded = true;
        setLoading(false);
        try {
          window.localStorage.setItem(
            getLessonCacheKey(gradeId, classNumber),
            JSON.stringify({ savedAt: Date.now(), lessons: results }),
          );
        } catch (storageError: unknown) {
          console.error('Could not cache class lesson data:', storageError);
          setProgressError('Your browser could not save lesson data for a faster next visit.');
        }

        const lastLessonId = window.localStorage.getItem(
          getLastLessonStorageKey(user.id, gradeId, classNumber),
        );
        const savedLesson = results.find((lesson) => lesson.id === lastLessonId);
        setSelectedLessonId((currentId) => {
          const currentLesson = results.find((lesson) => lesson.id === currentId);
          return (savedLesson ?? currentLesson ?? results[0])?.id ?? null;
        });

        const cachedCompletion = await cachedCompletionPromise;
        if (!active) return;
        const cachedIdsMatch = cachedLessons
          && cachedLessons.length === results.length
          && cachedLessons.every((lesson) => results.some((result) => result.id === lesson.id));
        let completedIds = cachedIdsMatch ? cachedCompletion?.ids : null;
        if (cachedCompletion?.error) {
          console.error('Could not load cached class completion status:', cachedCompletion.error);
        }
        if (!completedIds) {
          completedIds = await getCompletedLessonIds(results.map((lesson) => lesson.id), user.id);
        }
        if (!active) return;
        setCompletedLessonIds(completedIds);
        if (!savedLesson) {
          const firstIncompleteLesson = results.find((lesson) => !completedIds.includes(lesson.id));
          setSelectedLessonId((currentId) =>
            results.some((lesson) => lesson.id === currentId)
              ? currentId
              : (firstIncompleteLesson ?? results[0])?.id ?? null,
          );
        }
      } catch (loadError: unknown) {
        console.error('Failed to load class lessons or completion status:', loadError);
        if (!active) return;
        if (cachedLessons && !freshLessonsLoaded) {
          setProgressError('Could not refresh class lessons. Showing the saved lesson list instead.');
          setLoading(false);
        } else if (freshLessonsLoaded) {
          setProgressError('The lesson list loaded, but completion status could not be refreshed.');
        } else {
          setError(loadError instanceof Error ? loadError.message : 'Could not load lessons.');
          setLoading(false);
        }
      }
    };

    void loadLessons();
    return () => {
      active = false;
    };
  }, [gradeId, classNumber, authLoading, user]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const updateDesktop = () => setIsDesktop(mediaQuery.matches);
    updateDesktop();
    mediaQuery.addEventListener('change', updateDesktop);
    return () => mediaQuery.removeEventListener('change', updateDesktop);
  }, []);

  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId);

  useEffect(() => {
    if (!isDesktop || !selectedLesson) {
      setSelectedVideoUrl(null);
      return;
    }
    let active = true;
    setSelectedVideoUrl(null);
    getSignedLessonVideoUrl(selectedLesson.video_url)
      .then((url) => {
        if (active) setSelectedVideoUrl(url);
      })
      .catch((videoError: unknown) => {
        console.error('Could not load the selected lesson video:', videoError);
        if (active) {
          setSelectedVideoUrl(null);
          setProgressError(videoError instanceof Error ? videoError.message : 'Could not load this lesson video.');
        }
      });
    return () => {
      active = false;
    };
  }, [isDesktop, selectedLesson?.id, selectedLesson?.video_url]);

  const selectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setProgressError(null);
    if (!user) return;
    try {
      window.localStorage.setItem(
        getLastLessonStorageKey(user.id, gradeId, classNumber),
        lessonId,
      );
    } catch (storageError: unknown) {
      console.error('Could not save the last class lesson:', storageError);
      setProgressError('This browser could not save your place. The selected lesson will stay open until you leave this page.');
    }
  };

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
          <h1 className="mt-2 text-4xl font-black text-gray-950 dark:text-white">
            {isFoundation ? 'English Foundation lessons' : `Class ${classNumber} lessons`}
          </h1>
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
              {isFoundation
                ? 'Foundation lessons will appear here when they are added.'
                : `Lessons assigned to ${grade?.title}, Class ${classNumber} will appear here when they are uploaded.`}
            </p>
          </div>
        ) : (
          <>
          <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(15rem,20rem)_minmax(0,1fr)]">
            <aside
              aria-label="Class lessons"
              className="sticky top-24 max-h-[calc(100vh-8rem)] self-start overflow-y-auto rounded-2xl bg-white p-4 shadow-md ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
            >
              <h2 className="mb-3 px-2 text-lg font-bold text-gray-900 dark:text-white">Lessons</h2>
              <ol className="space-y-2">
                {lessons.map((lesson) => {
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  const isSelected = selectedLessonId === lesson.id;
                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        onClick={() => selectLesson(lesson.id)}
                        aria-current={isSelected ? 'true' : undefined}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-blue-400 bg-blue-50 shadow-sm dark:border-blue-600 dark:bg-blue-950/40'
                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold ${
                            isCompleted
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                              : `bg-gradient-to-br ${grade?.accent} text-white`
                          }`}
                        >
                          {isCompleted
                            ? <CheckCircleIcon className="h-6 w-6" aria-label="Completed" />
                            : lesson.display_order}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-gray-900 dark:text-white">
                            {lesson.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                            {isCompleted ? 'Completed' : `Lesson ${lesson.display_order}`}
                          </span>
                        </span>
                        {isSelected && <PlayIcon className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-300" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </aside>
            <section
              aria-label="Selected lesson"
              className="min-w-0 rounded-2xl bg-white p-4 shadow-md ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 sm:p-6"
            >
              {progressError && (
                <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200" role="status">
                  {progressError}
                </p>
              )}
              {selectedLesson ? (
                selectedVideoUrl ? (
                  <LessonDetails
                    lesson={{ ...selectedLesson, video_url: selectedVideoUrl }}
                    embedded
                  />
                ) : (
                  <p className="p-8 text-center text-gray-600 dark:text-gray-300" role="status">
                    Loading selected lesson...
                  </p>
                )
              ) : (
                <p className="p-8 text-center text-gray-600 dark:text-gray-300">Choose a lesson from the list.</p>
              )}
            </section>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:hidden">
            {lessons.map((lesson) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              return (
                <article
                  key={lesson.id}
                  className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span
                      aria-label={`Lesson ${lesson.display_order}`}
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${grade?.accent} text-lg font-extrabold text-white`}
                    >
                      {lesson.display_order}
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
          </>
        )}
      </div>
    </div>
  );
}
