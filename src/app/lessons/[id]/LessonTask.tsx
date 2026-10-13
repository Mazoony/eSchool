'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { createClient } from '@/utils/supabase/client';
import {
  getStudentLessonSubmission,
  LessonGradingStatus,
  saveStudentLessonSubmission,
} from '@/utils/supabase/lessonTasks';
import ExpandableText from '../../components/ExpandableText';
import TaskPromptMeanings from '../../components/TaskPromptMeanings';

function createTaskDraft(prompt: string, answer = ''): string {
  if (!answer) return prompt;
  return answer.startsWith(prompt) ? answer : `${prompt}\n\n${answer}`;
}

function getBlankCount(prompt: string): number {
  return (prompt.match(/_{2,}/g) ?? []).length;
}

function getBlankAnswers(prompt: string, submission = ''): string[] {
  const answers = Array.from({ length: getBlankCount(prompt) }, () => '');
  if (!submission || answers.length === 0) return answers;

  const promptLines = prompt.split(/\r?\n/);
  const submissionLines = submission.split(/\r?\n/);
  let answerIndex = 0;

  promptLines.forEach((promptLine, lineIndex) => {
    if (!promptLine.includes('__')) return;

    const segments = promptLine.split(/_{2,}/g);
    const pattern = new RegExp(
      `^${segments.map((segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('([\\s\\S]*?)')}$`,
    );
    const match = pattern.exec(submissionLines[lineIndex] ?? '');
    if (match) {
      for (const value of match.slice(1)) {
        answers[answerIndex] = value.trim().replace(/^_+|_+$/g, '');
        answerIndex += 1;
      }
    } else {
      answerIndex += segments.length - 1;
    }
  });

  return answers;
}

function fillPromptBlanks(prompt: string, answers: string[]): string {
  let answerIndex = 0;
  return prompt.replace(/_{2,}/g, () => answers[answerIndex++]?.trim() ?? '');
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
  const [blankAnswers, setBlankAnswers] = useState<string[]>(() => getBlankAnswers(prompt));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [savedAnswer, setSavedAnswer] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [gradingStatus, setGradingStatus] = useState<LessonGradingStatus>('pending');
  const [gradingFeedback, setGradingFeedback] = useState<string | null>(null);
  const [gradingError, setGradingError] = useState<string | null>(null);
  const [retryingGrading, setRetryingGrading] = useState(false);
  const [pendingGradingSubmissionId, setPendingGradingSubmissionId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const visibleAnswers = getStudentVisibleAnswers(prompt, savedAnswer);

  useEffect(() => {
    if (!user) return;
    let active = true;

    getStudentLessonSubmission(lessonId, user.id)
      .then((submission) => {
        if (!active) return;
        if (submission) {
          setSubmissionId(submission.id);
          setAnswer(createTaskDraft(prompt, submission.answer));
          setBlankAnswers(getBlankAnswers(prompt, submission.answer));
          setSavedAnswer(submission.answer);
          setScore(submission.score);
          setGradingStatus(submission.grading_status);
          setGradingFeedback(submission.grading_feedback);
          setSavedAt(submission.updated_at);
          if (submission.grading_status === 'pending') {
            setPendingGradingSubmissionId(submission.id);
          }
        } else {
          setAnswer(createTaskDraft(prompt));
          setBlankAnswers(getBlankAnswers(prompt));
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
              setSubmissionId(submission?.id ?? null);
              setScore(submission?.score ?? null);
              setGradingStatus(submission?.grading_status ?? 'pending');
              setGradingFeedback(submission?.grading_feedback ?? null);
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

  const requestAutomaticGrading = useCallback(async (submissionId: string) => {
    setRetryingGrading(true);
    setGradingError(null);
    setGradingStatus('grading');
    try {
      const { data, error: gradingRequestError } = await createClient().functions.invoke(
        'grade-lesson-submission',
        { body: { submissionId } },
      );
      if (gradingRequestError) {
        console.error('Automatic grading request failed:', gradingRequestError.message);
        setGradingStatus('grading_failed');
        setGradingError('Your answer was submitted, but automatic grading could not be completed. A teacher will review it.');
        return;
      }
      if (typeof data !== 'object' || data === null) {
        throw new Error('The grading service returned an invalid response.');
      }

      const result = data as {
        score?: unknown;
        gradingStatus?: unknown;
        feedback?: unknown;
        error?: unknown;
      };
      if (
        result.gradingStatus !== 'pending'
        && result.gradingStatus !== 'grading'
        && result.gradingStatus !== 'ai_graded'
        && result.gradingStatus !== 'needs_review'
        && result.gradingStatus !== 'grading_failed'
        && result.gradingStatus !== 'teacher_reviewed'
      ) {
        throw new Error(typeof result.error === 'string' ? result.error : 'The grading service returned an invalid status.');
      }

      setGradingStatus(result.gradingStatus);
      setScore(typeof result.score === 'number' ? result.score : null);
      setGradingFeedback(typeof result.feedback === 'string' ? result.feedback : null);
      if (result.gradingStatus === 'grading_failed') {
        setGradingError('Your answer was submitted, but automatic grading could not be completed. A teacher will review it.');
      }
    } catch (gradingError: unknown) {
      console.error('Could not process the automatic grading result:', gradingError);
      setGradingStatus('grading_failed');
      setGradingError('Your answer was submitted, but automatic grading could not be completed. A teacher will review it.');
    } finally {
      setRetryingGrading(false);
    }
  }, []);

  useEffect(() => {
    if (!pendingGradingSubmissionId) return;
    setPendingGradingSubmissionId(null);
    void requestAutomaticGrading(pendingGradingSubmissionId);
  }, [pendingGradingSubmissionId, requestAutomaticGrading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    try {
      const submittedAnswer = blankAnswers.length > 0
        ? fillPromptBlanks(prompt, blankAnswers)
        : (() => {
          const draft = answer.trim();
          return draft === createTaskDraft(prompt, savedAnswer).trim() ? savedAnswer : draft;
        })();
      await saveStudentLessonSubmission(lessonId, user.id, submittedAnswer);
      const submission = await getStudentLessonSubmission(lessonId, user.id);
      if (!submission) throw new Error('Your answer was saved, but could not be loaded for grading.');
      setSubmissionId(submission.id);
      setScore(submission.score);
      setGradingStatus(submission.grading_status);
      setGradingFeedback(submission.grading_feedback);
      setGradingError(null);
      setSavedAnswer(submittedAnswer);
      setAnswer(createTaskDraft(prompt, submittedAnswer));
      setBlankAnswers(getBlankAnswers(prompt, submittedAnswer));
      setSavedAt(submission.updated_at);
      setEditing(false);
      if (submission.grading_status === 'pending' || submission.grading_status === 'grading_failed') {
        await requestAutomaticGrading(submission.id);
      }
    } catch (saveError: unknown) {
      console.error('Could not save lesson task submission:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Could not submit your answer.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setAnswer(createTaskDraft(prompt, savedAnswer));
    setBlankAnswers(getBlankAnswers(prompt, savedAnswer));
    setEditing(false);
    setError(null);
  };
  const allBlanksFilled = blankAnswers.every((value) => value.trim().length > 0);
  let renderedBlankIndex = 0;

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
          <div lang="en" dir="ltr">
            <ExpandableText
              text={visibleAnswers}
              className="rounded-md border border-gray-200 bg-gray-50 p-4 text-left text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
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
            {gradingStatus === 'grading' && 'Your answer is being checked automatically.'}
            {gradingStatus === 'pending' && 'Your answer is waiting to be marked.'}
            {gradingStatus === 'grading_failed' && 'Your answer was submitted and is waiting for teacher review.'}
            {gradingStatus === 'needs_review' && 'Your answer needs teacher review before a mark is available.'}
            {score !== null && `Your mark: ${score} / ${maxScore} (${((score / maxScore) * 100).toFixed(1)}%).`}
            {gradingStatus === 'teacher_reviewed' && score === null && 'Your teacher cleared the mark; it is waiting to be reviewed again.'}
          </p>
          {gradingFeedback && (
            <p className="mt-2 rounded-md bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
              {gradingFeedback}
            </p>
          )}
          {gradingError && (
            <div className="mt-3">
              <p className="text-sm text-amber-800 dark:text-amber-200" role="alert">{gradingError}</p>
              {(gradingStatus === 'grading_failed' || gradingStatus === 'pending') && submissionId && (
                <button
                  type="button"
                  onClick={() => void requestAutomaticGrading(submissionId)}
                  disabled={retryingGrading}
                  className="mt-2 rounded-md border border-amber-500 px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-50 disabled:opacity-50 dark:text-amber-100 dark:hover:bg-amber-950"
                >
                  {retryingGrading ? 'Retrying...' : 'Retry automatic grading'}
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
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
          {blankAnswers.length > 0 ? (
            <>
              <label className="mb-2 block font-medium text-gray-800 dark:text-gray-100">
                Fill in each answer
              </label>
              <div lang="en" dir="ltr" translate="no" className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4 text-left text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                {prompt.split(/\r?\n/).map((line, lineIndex) => {
                  const parts = line.split(/(_{2,})/g);
                  return (
                    <p key={`${lineIndex}-${line}`} className="whitespace-pre-wrap leading-8">
                      {parts.map((part, partIndex) => {
                        if (!/^_{2,}$/.test(part)) {
                          return <span key={`${partIndex}-${part}`}>{part}</span>;
                        }
                        const currentBlankIndex = renderedBlankIndex++;
                        return (
                          <input
                            key={`blank-${currentBlankIndex}`}
                            aria-label={`Answer ${currentBlankIndex + 1}`}
                            autoComplete="off"
                            value={blankAnswers[currentBlankIndex] ?? ''}
                            onChange={(event) => {
                              const nextAnswers = [...blankAnswers];
                              nextAnswers[currentBlankIndex] = event.target.value;
                              setBlankAnswers(nextAnswers);
                            }}
                            maxLength={300}
                            required
                            disabled={saving}
                            className="mx-1 inline-block w-28 rounded-md border border-blue-300 bg-white px-2 py-1 align-baseline text-center text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-700 dark:bg-gray-800 dark:text-white sm:w-36"
                          />
                        );
                      })}
                    </p>
                  );
                })}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Write only the answer in each box. Complete all {blankAnswers.length} {blankAnswers.length === 1 ? 'answer' : 'answers'} to submit.
              </p>
            </>
          ) : (
            <>
              <label htmlFor="lesson-task-answer" className="mb-2 block font-medium text-gray-800 dark:text-gray-100">
                Task and your answers
              </label>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                Enter your answer below.
              </p>
              <textarea
                id="lesson-task-answer"
                lang="en"
                dir="ltr"
                translate="no"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                maxLength={10000}
                rows={6}
                required
                disabled={saving}
                className="w-full rounded-md border border-gray-300 bg-white p-3 text-left text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {blankAnswers.length > 0
                ? `${blankAnswers.filter((value) => value.trim()).length}/${blankAnswers.length} answers complete`
                : `${answer.length}/10,000 characters`}
            </p>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || (blankAnswers.length > 0 ? !allBlanksFilled : !answer.trim())}
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
