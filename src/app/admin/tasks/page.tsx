'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import {
  getLessonSubmissions,
  getLessonsWithTasks,
  LessonSubmission,
  LessonTask,
  saveLessonSubmissionScore,
  saveLessonTaskSettings,
} from '@/utils/supabase/lessonTasks';

export default function AdminTasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.email === 'wadareaf@gmail.com';
  const [lessons, setLessons] = useState<LessonTask[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [submissions, setSubmissions] = useState<LessonSubmission[]>([]);
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [savingScoreId, setSavingScoreId] = useState<string | null>(null);
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
    setMaxScore(String(selectedLesson.task_max_score));
    setScoreDrafts({});
    void loadSubmissions(selectedLessonId);
  }, [lessons, selectedLessonId, loadSubmissions]);

  const handleSavePrompt = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedLessonId) return;

    setSavingPrompt(true);
    setError(null);
    setMessage(null);
    try {
      const numericMaxScore = Number(maxScore);
      await saveLessonTaskSettings(selectedLessonId, prompt, numericMaxScore);
      const taskPrompt = prompt.trim() || null;
      setLessons((current) => current.map((lesson) => (
        lesson.id === selectedLessonId
          ? { ...lesson, task_prompt: taskPrompt, task_max_score: numericMaxScore }
          : lesson
      )));
      setMessage(taskPrompt ? 'Task settings saved.' : 'Task removed; maximum mark saved.');
    } catch (saveError: unknown) {
      console.error('Could not save lesson task prompt:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Could not save the task prompt.');
    } finally {
      setSavingPrompt(false);
    }
  };

  const handleSaveScore = async (
    event: React.FormEvent<HTMLFormElement>,
    submission: LessonSubmission,
  ) => {
    event.preventDefault();
    const draft = scoreDrafts[submission.id] ?? '';
    const score = draft.trim() === '' ? null : Number(draft);
    if (score !== null && (!Number.isFinite(score) || score < 0 || score > (selectedLesson?.task_max_score ?? 0))) {
      setError(`Enter a mark from 0 to ${selectedLesson?.task_max_score ?? 0}.`);
      return;
    }

    setSavingScoreId(submission.id);
    setError(null);
    setMessage(null);
    try {
      await saveLessonSubmissionScore(submission.id, score);
      setSubmissions((current) => current.map((item) => (
        item.id === submission.id ? { ...item, score } : item
      )));
      setScoreDrafts((current) => ({ ...current, [submission.id]: score === null ? '' : String(score) }));
      setMessage(score === null ? 'Mark cleared.' : 'Mark saved.');
    } catch (saveError: unknown) {
      console.error('Could not save the student task mark:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Could not save the mark.');
    } finally {
      setSavingScoreId(null);
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
              <label htmlFor="task-max-score" className="mb-2 mt-4 block font-semibold">
                Maximum mark
              </label>
              <input
                id="task-max-score"
                type="number"
                min="0.01"
                max="10000"
                step="0.01"
                required
                value={maxScore}
                onChange={(event) => setMaxScore(event.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Leave the prompt blank to remove the task. Existing marks prevent setting a lower maximum.
                </p>
                <button
                  type="submit"
                  disabled={savingPrompt}
                  className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingPrompt ? 'Saving...' : 'Save task settings'}
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
                    <form
                      onSubmit={(event) => void handleSaveScore(event, submission)}
                      className="mt-4 flex flex-wrap items-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700"
                    >
                      <div>
                        <label htmlFor={`score-${submission.id}`} className="mb-1 block text-sm font-medium">
                          Mark (out of {selectedLesson?.task_max_score ?? 100})
                        </label>
                        <input
                          id={`score-${submission.id}`}
                          type="number"
                          min="0"
                          max={selectedLesson?.task_max_score ?? 100}
                          step="0.01"
                          value={scoreDrafts[submission.id] ?? (submission.score === null ? '' : String(submission.score))}
                          onChange={(event) => setScoreDrafts((current) => ({
                            ...current,
                            [submission.id]: event.target.value,
                          }))}
                          placeholder="Not graded"
                          className="w-40 rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={savingScoreId === submission.id}
                        className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {savingScoreId === submission.id ? 'Saving...' : 'Save mark'}
                      </button>
                    </form>
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
