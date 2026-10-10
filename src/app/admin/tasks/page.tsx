'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import {
  getLessonSubmissions,
  getLessonsWithTasks,
  LessonSubmission,
  LessonTask,
  saveLessonTaskPrompt,
} from '@/utils/supabase/lessonTasks';

export default function AdminTasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.email === 'wadareaf@gmail.com';
  const [lessons, setLessons] = useState<LessonTask[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [submissions, setSubmissions] = useState<LessonSubmission[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    let active = true;

    getLessonsWithTasks()
      .then((items) => {
        if (!active) return;
        setLessons(items);
        if (items.length) {
          setSelectedLessonId(items[0].id);
          setPrompt(items[0].task_prompt ?? '');
        }
      })
      .catch((loadError: unknown) => {
        console.error('Could not load lessons for task management:', loadError);
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load lessons.');
      })
      .finally(() => {
        if (active) setLoadingLessons(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, isAdmin]);

  const loadSubmissions = useCallback(async (lessonId: string) => {
    setLoadingSubmissions(true);
    setError(null);
    try {
      const items = await getLessonSubmissions(lessonId);
      setSubmissions(items);
    } catch (loadError: unknown) {
      console.error('Could not load lesson task submissions:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Could not load submissions.');
    } finally {
      setLoadingSubmissions(false);
    }
  }, []);

  useEffect(() => {
    const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId);
    if (!selectedLesson) {
      setSubmissions([]);
      return;
    }
    setPrompt(selectedLesson.task_prompt ?? '');
    void loadSubmissions(selectedLessonId);
  }, [lessons, selectedLessonId, loadSubmissions]);

  const handleSavePrompt = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedLessonId) return;

    setSavingPrompt(true);
    setError(null);
    setMessage(null);
    try {
      await saveLessonTaskPrompt(selectedLessonId, prompt);
      const taskPrompt = prompt.trim() || null;
      setLessons((current) => current.map((lesson) => (
        lesson.id === selectedLessonId ? { ...lesson, task_prompt: taskPrompt } : lesson
      )));
      setMessage(taskPrompt ? 'Task prompt saved.' : 'Task prompt removed.');
    } catch (saveError: unknown) {
      console.error('Could not save lesson task prompt:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Could not save the task prompt.');
    } finally {
      setSavingPrompt(false);
    }
  };

  if (authLoading || !user) return <p className="p-8 text-center">Checking your sign-in...</p>;
  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-2xl p-8 text-center">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="mt-2">You do not have permission to review lesson tasks.</p>
      </main>
    );
  }

  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Lesson Tasks</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">Set prompts and review students’ written answers.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin/upload')}
          className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Upload a lesson
        </button>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-red-700" role="alert">{error}</p>}
      {message && <p className="mb-4 rounded-md bg-green-50 p-3 text-green-700" role="status">{message}</p>}

      {loadingLessons ? (
        <p role="status">Loading lessons...</p>
      ) : lessons.length === 0 ? (
        <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <p>No lessons have been uploaded yet.</p>
        </section>
      ) : (
        <>
          <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <label htmlFor="task-lesson" className="mb-2 block font-semibold">
              Lesson
            </label>
            <select
              id="task-lesson"
              value={selectedLessonId}
              onChange={(event) => {
                setSelectedLessonId(event.target.value);
                setError(null);
                setMessage(null);
              }}
              className="mb-5 w-full rounded-md border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
            >
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
              ))}
            </select>

            <form onSubmit={handleSavePrompt}>
              <label htmlFor="task-prompt" className="mb-2 block font-semibold">
                Task prompt
              </label>
              <textarea
                id="task-prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                maxLength={5000}
                rows={5}
                placeholder="Write the task students should complete after watching the lesson."
                className="w-full rounded-md border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Leave blank and save to remove the task.
                </p>
                <button
                  type="submit"
                  disabled={savingPrompt}
                  className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingPrompt ? 'Saving...' : 'Save task prompt'}
                </button>
              </div>
            </form>
          </section>

          <section aria-labelledby="submissions-heading" className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="submissions-heading" className="text-2xl font-bold">
                Student submissions{selectedLesson ? `: ${selectedLesson.title}` : ''}
              </h2>
              {selectedLessonId && (
                <button
                  type="button"
                  onClick={() => void loadSubmissions(selectedLessonId)}
                  disabled={loadingSubmissions}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  Refresh
                </button>
              )}
            </div>
            {loadingSubmissions ? (
              <p role="status">Loading submissions...</p>
            ) : submissions.length === 0 ? (
              <p className="rounded-lg bg-white p-5 text-gray-600 shadow dark:bg-gray-800 dark:text-gray-300">
                No answers have been submitted for this lesson yet.
              </p>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <article key={submission.id} className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold">
                        {submission.student.full_name || (submission.student.username ? `@${submission.student.username}` : `Student ${submission.student.id.slice(0, 8)}`)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Updated {new Date(submission.updated_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-100">{submission.answer}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
