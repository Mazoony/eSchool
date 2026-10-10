'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { createClient } from '@/utils/supabase/client';
import {
  getStudentLessonSubmission,
  saveStudentLessonSubmission,
} from '@/utils/supabase/lessonTasks';

export default function LessonTask({
  lessonId,
  prompt,
  maxScore,
}: {
  lessonId: string;
  prompt: string;
  maxScore: number;
}) {
  const { user } = useAuth();
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [savedAnswer, setSavedAnswer] = useState('');
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    getStudentLessonSubmission(lessonId, user.id)
      .then((submission) => {
        if (!active) return;
        if (submission) {
          setAnswer(submission.answer);
          setSavedAnswer(submission.answer);
          setScore(submission.score);
          setSavedAt(submission.updated_at);
        }
      })
      .catch((loadError: unknown) => {
        console.error('Could not load lesson task submission:', loadError);
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load your answer.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lessonId, user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const client = createClient();
    const channel = client
      .channel(`lesson-submission:${user.id}:${lessonId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lesson_submissions',
          filter: `student_id=eq.${user.id}`,
        },
        () => {
          getStudentLessonSubmission(lessonId, user.id)
            .then((submission) => {
              if (!active) return;
              setScore(submission?.score ?? null);
              if (submission) setSavedAt(submission.updated_at);
            })
            .catch((loadError: unknown) => {
              console.error('Could not refresh your task mark:', loadError);
              if (active) setError(loadError instanceof Error ? loadError.message : 'Could not refresh your mark.');
            });
        },
      )
      .subscribe();

    return () => {
      active = false;
      void client.removeChannel(channel);
    };
  }, [lessonId, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    try {
      const submittedAnswer = answer.trim();
      await saveStudentLessonSubmission(lessonId, user.id, answer);
      if (submittedAnswer !== savedAnswer) setScore(null);
      setSavedAnswer(submittedAnswer);
      setSavedAt(new Date().toISOString());
    } catch (saveError: unknown) {
      console.error('Could not save lesson task submission:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Could not submit your answer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="lesson-task-heading" className="mt-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h2 id="lesson-task-heading" className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-50">
        Your Task
      </h2>
      <p className="mb-5 whitespace-pre-wrap text-gray-700 dark:text-gray-200">{prompt}</p>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        This task is marked out of {maxScore}.
      </p>
      {loading ? (
        <p role="status" className="text-sm text-gray-600 dark:text-gray-300">Loading your answer...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="lesson-task-answer" className="mb-2 block font-medium text-gray-800 dark:text-gray-100">
            Your written answer
          </label>
          <textarea
            id="lesson-task-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            maxLength={10000}
            rows={6}
            required
            disabled={saving}
            className="w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {answer.length}/10,000 characters
            </p>
            <button
              type="submit"
              disabled={saving || !answer.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Submitting...' : savedAt ? 'Update answer' : 'Submit answer'}
            </button>
          </div>
          {savedAt && (
            <p className="mt-3 text-sm text-green-700 dark:text-green-300" role="status">
              Answer saved and shared in the social feed. You can update it any time; your feed post will be updated too.
            </p>
          )}
          {savedAt && (
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-200" role="status">
              {score === null
                ? 'Your answer is waiting to be marked.'
                : `Your mark: ${score} / ${maxScore} (${((score / maxScore) * 100).toFixed(1)}%).`}
            </p>
          )}
          {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
        </form>
      )}
    </section>
  );
}
