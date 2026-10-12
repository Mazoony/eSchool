'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { createClient } from '@/utils/supabase/client';
import {
  getStudentLessonSubmission,
  saveStudentLessonSubmission,
} from '@/utils/supabase/lessonTasks';
import ExpandableText from '../../components/ExpandableText';
import TaskPromptMeanings from '../../components/TaskPromptMeanings';

function createTaskDraft(prompt: string, answer = ''): string {
  if (!answer) return prompt;
  return answer.startsWith(prompt) ? answer : `${prompt}\n\n${answer}`;
}

function getStudentVisibleAnswers(prompt: string, submission: string): string {
  const promptLines = prompt.split(/\r?\n/);
  const submissionLines = submission.split(/\r?\n/);
  const answerLines: string[] = [];

  promptLines.forEach((promptLine, index) => {
    if (!promptLine.includes('__')) return;

    const segments = promptLine.split(/_{2,}/g);
    const pattern = new RegExp(
      `^${segments.map((segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('([\\s\\S]*?)')}$`,
    );
    const match = pattern.exec(submissionLines[index] ?? '');
    if (!match) return;

    const answers = match.slice(1).map((value) => value.trim().replace(/^_+|_+$/g, '')).filter(Boolean);
    if (!answers.length) return;

    const number = promptLine.match(/^\s*\d+[.)]/)?.[0]?.trim();
    answerLines.push(`${number ? `${number} ` : ''}${answers.join(', ')}`);
  });

  if (answerLines.length) return answerLines.join('\n');

  if (submission.startsWith(prompt)) {
    return submission.slice(prompt.length).trim() || 'No answers were entered in the task blanks.';
  }

  return submission;
}

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
  const [editing, setEditing] = useState(false);
  const visibleAnswers = getStudentVisibleAnswers(prompt, savedAnswer);

  useEffect(() => {
    if (!user) return;
    let active = true;

    getStudentLessonSubmission(lessonId, user.id)
      .then((submission) => {
        if (!active) return;
        if (submission) {
          setAnswer(createTaskDraft(prompt, submission.answer));
          setSavedAnswer(submission.answer);
          setScore(submission.score);
          setSavedAt(submission.updated_at);
        } else {
          setAnswer(createTaskDraft(prompt));
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
  }, [lessonId, prompt, user]);

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
      const draft = answer.trim();
      const submittedAnswer = draft === createTaskDraft(prompt, savedAnswer).trim()
        ? savedAnswer
        : draft;
      await saveStudentLessonSubmission(lessonId, user.id, submittedAnswer);
      if (submittedAnswer !== savedAnswer) setScore(null);
      setSavedAnswer(submittedAnswer);
      setAnswer(createTaskDraft(prompt, submittedAnswer));
      setSavedAt(new Date().toISOString());
      setEditing(false);
    } catch (saveError: unknown) {
      console.error('Could not save lesson task submission:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Could not submit your answer.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setAnswer(createTaskDraft(prompt, savedAnswer));
    setEditing(false);
    setError(null);
  };

  return (
    <section aria-labelledby="lesson-task-heading" className="mt-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h2 id="lesson-task-heading" className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-50">
        Your Task
      </h2>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        This task is marked out of {maxScore}.
      </p>
      {loading ? (
        <p role="status" className="text-sm text-gray-600 dark:text-gray-300">Loading your answer...</p>
      ) : savedAt && !editing ? (
        <div>
          <h3 className="mb-2 font-medium text-gray-800 dark:text-gray-100">Your answers</h3>
          <ExpandableText
            text={visibleAnswers}
            className="rounded-md border border-gray-200 bg-gray-50 p-4 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Edit answer
          </button>
          <p className="mt-3 text-sm text-green-700 dark:text-green-300" role="status">
            Lesson completed. Your answer is submitted and shared in the social feed. You can edit your answer, but cannot delete it.
          </p>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200" role="status">
            {score === null
              ? 'Your answer is waiting to be marked.'
              : `Your mark: ${score} / ${maxScore} (${((score / maxScore) * 100).toFixed(1)}%).`}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="lesson-task-answer" className="mb-2 block font-medium text-gray-800 dark:text-gray-100">
            Task and your answers
          </label>
          <details className="mb-3 rounded-lg border border-blue-200 bg-blue-50/70 p-3 dark:border-blue-900 dark:bg-blue-950/30">
            <summary className="cursor-pointer font-semibold text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-200">
              Arabic meanings (hover over or tap a word)
            </summary>
            <div className="mt-3 border-t border-blue-200 pt-3 dark:border-blue-900">
              <TaskPromptMeanings prompt={prompt} />
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Meanings are automatic translations and may depend on context.
              </p>
            </div>
          </details>
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
            Edit the prefilled task directly, fill in the blanks, then submit. There is no separate answer section.
          </p>
          <textarea
            id="lesson-task-answer"
            lang="ar"
            dir="rtl"
            translate="no"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            maxLength={10000}
            rows={6}
            required
            disabled={saving}
            className="w-full rounded-md border border-gray-300 bg-white p-3 text-right text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {answer.length}/10,000 characters
            </p>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || !answer.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Submitting...' : savedAt ? 'Save changes' : 'Submit answer'}
              </button>
              {savedAt && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          {savedAt && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              Saving updates your existing task submission and feed post. Your mark will be cleared if you change the submitted text.
            </p>
          )}
          {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
        </form>
      )}
    </section>
  );
}
