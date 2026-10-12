'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { getLessons, Lesson } from '@/app/lessons/actions';
import { GradeId, grades, isGradeId } from '@/app/lessons/curriculum';

const adminEmail = 'wadareaf@gmail.com';

function getVideoStoragePath(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    const segments = url.pathname.split('/').filter(Boolean);
    const markerIndex = segments.findIndex((segment, index) =>
      segment === 'object' && segments[index - 1] === 'v1' && segments[index - 2] === 'storage',
    );
    if (markerIndex < 0 || segments[markerIndex + 2] !== 'videos') return null;
    return segments.slice(markerIndex + 3).map((segment) => decodeURIComponent(segment)).join('/');
  } catch {
    return null;
  }
}

export default function AdminLessonsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.email === adminEmail;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskPrompt, setTaskPrompt] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [grade, setGrade] = useState<GradeId | ''>('');
  const [classNumber, setClassNumber] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId);

  const loadLessons = useCallback(async () => {
    setLoadingLessons(true);
    setError(null);
    try {
      const items = await getLessons();
      setLessons(items);
      setSelectedLessonId((currentId) =>
        items.some((lesson) => lesson.id === currentId) ? currentId : items[0]?.id ?? '',
      );
    } catch (loadError: unknown) {
      console.error('Could not load lessons for editing:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Could not load lessons.');
    } finally {
      setLoadingLessons(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
    else if (!authLoading && user && !isAdmin) router.replace('/social');
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (!authLoading && isAdmin) void loadLessons();
  }, [authLoading, isAdmin, loadLessons]);

  useEffect(() => {
    if (!selectedLesson) return;
    setTitle(selectedLesson.title);
    setDescription(selectedLesson.description);
    setTaskPrompt(selectedLesson.task_prompt ?? '');
    setMaxScore(String(selectedLesson.task_max_score));
    setDisplayOrder(String(selectedLesson.display_order));
    setGrade(selectedLesson.grade ?? '');
    setClassNumber(selectedLesson.class_number === null ? '' : String(selectedLesson.class_number));
    setVideoFile(null);
  }, [selectedLesson]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !isAdmin || !selectedLesson) return;

    const numericMaxScore = Number(maxScore);
    if (!Number.isFinite(numericMaxScore) || numericMaxScore <= 0 || numericMaxScore > 10000) {
      setError('The maximum mark must be greater than 0 and no more than 10,000.');
      return;
    }
    if (!Number.isInteger(numericMaxScore * 100)) {
      setError('The maximum mark can have up to two decimal places.');
      return;
    }
    const numericDisplayOrder = Number(displayOrder);
    if (!Number.isSafeInteger(numericDisplayOrder) || numericDisplayOrder < 1) {
      setError('The lesson order must be a positive whole number.');
      return;
    }
    if (
      (grade && grade !== 'english-foundation' && !classNumber)
      || (!grade && classNumber)
      || (grade === 'english-foundation' && classNumber)
    ) {
      setError('Select a class for school grades. English Foundation does not use classes.');
      return;
    }
    if (
      grade
      && (
        !isGradeId(grade)
        || (grade !== 'english-foundation'
          && Number(classNumber) > (grades.find((item) => item.id === grade)?.classCount ?? 0))
      )
    ) {
      setError('Select a valid class for the chosen grade.');
      return;
    }
    if (taskPrompt.length > 5000) {
      setError('The task prompt must be 5,000 characters or fewer.');
      return;
    }
    if (videoFile && videoFile.size > 50 * 1024 * 1024) {
      setError('The video must be 50 MB or smaller.');
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    const client = createClient();
    let uploadedPath: string | null = null;

    try {
      if (videoFile) {
        const extension = videoFile.name.split('.').pop()?.toLowerCase();
        const supportedTypes: Record<string, string> = {
          mp4: 'video/mp4',
          webm: 'video/webm',
        };
        if (!extension || !supportedTypes[extension] || videoFile.type !== supportedTypes[extension]) {
          throw new Error('Choose a valid MP4 or WebM video file.');
        }

        uploadedPath = `lessons/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await client.storage
          .from('videos')
          .upload(uploadedPath, videoFile, {
            contentType: supportedTypes[extension],
            cacheControl: '3600',
          });
        if (uploadError) throw new Error(`Could not upload the replacement video: ${uploadError.message}`);
      }

      const updates = {
        title: title.trim(),
        description: description.trim(),
        task_prompt: taskPrompt.trim() || null,
        task_max_score: numericMaxScore,
        display_order: numericDisplayOrder,
        grade: grade || null,
        class_number: grade && grade !== 'english-foundation' ? Number(classNumber) : null,
        ...(uploadedPath ? { video_url: uploadedPath } : {}),
      };
      const { error: updateError } = await client
        .from('lessons')
        .update(updates)
        .eq('id', selectedLesson.id);
      if (updateError) throw new Error(`Could not save lesson details: ${updateError.message}`);

      let cleanupWarning = '';
      if (uploadedPath && selectedLesson.video_url) {
        const oldPath = getVideoStoragePath(selectedLesson.video_url);
        if (oldPath && oldPath !== uploadedPath) {
          const { error: removeError } = await client.storage.from('videos').remove([oldPath]);
          if (removeError) {
            console.error('Lesson details were saved, but the previous video could not be removed:', removeError);
            cleanupWarning = ' The previous video could not be removed from storage.';
          }
        }
      }

      setLessons((current) => current
        .map((lesson) => lesson.id === selectedLesson.id
          ? { ...lesson, ...updates, video_url: uploadedPath ?? lesson.video_url }
          : lesson)
        .sort((first, second) =>
          (first.grade ?? '').localeCompare(second.grade ?? '')
          || (first.class_number ?? 0) - (second.class_number ?? 0)
          || first.display_order - second.display_order
          || new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
        ));
      setVideoFile(null);
      setMessage(`Lesson details saved.${cleanupWarning}`);
    } catch (saveError: unknown) {
      console.error('Could not save lesson details:', saveError);
      if (uploadedPath) {
        const { error: cleanupError } = await client.storage.from('videos').remove([uploadedPath]);
        if (cleanupError) {
          console.error('Could not remove the replacement video after lesson update failed:', cleanupError);
        }
      }
      setError(saveError instanceof Error ? saveError.message : 'Could not save lesson details.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user || !isAdmin) {
    return <p className="p-8 text-center" role="status">Checking administrator access...</p>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Edit lesson details</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Update lesson information, task settings, grade placement, or replace its video.
        </p>
      </header>

      {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-200" role="alert">{error}</p>}
      {message && <p className="mb-4 rounded-md bg-green-50 p-3 text-green-700 dark:bg-green-950 dark:text-green-200" role="status">{message}</p>}

      {loadingLessons ? (
        <p className="rounded-lg bg-white p-6 text-center shadow dark:bg-gray-800" role="status">Loading lessons...</p>
      ) : lessons.length === 0 ? (
        <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <p>No lessons are available to edit.</p>
        </section>
      ) : (
        <form onSubmit={handleSave} className="space-y-5 rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <div>
            <label htmlFor="edit-lesson" className="mb-2 block font-semibold">Choose a lesson</label>
            <select
              id="edit-lesson"
              value={selectedLessonId}
              onChange={(event) => {
                setSelectedLessonId(event.target.value);
                setError(null);
                setMessage(null);
              }}
              className="w-full rounded-md border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
            >
              {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="edit-title" className="mb-2 block font-semibold">Title</label>
            <input
              id="edit-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              required
              disabled={saving}
              className="w-full rounded-md border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="mb-2 block font-semibold">Description</label>
            <textarea
              id="edit-description"
              lang="ar"
              dir="rtl"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={10000}
              rows={5}
              required
              disabled={saving}
              className="w-full rounded-md border border-gray-300 bg-white p-3 text-right dark:border-gray-600 dark:bg-gray-700"
            />
          </div>

          <div>
            <label htmlFor="edit-display-order" className="mb-2 block font-semibold">Display order</label>
            <input
              id="edit-display-order"
              type="number"
              min="1"
              step="1"
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value)}
              required
              disabled={saving}
              className="w-full rounded-md border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Lower numbers appear first within {grade
                ? grade === 'english-foundation'
                  ? 'English Foundation'
                  : `${grades.find((item) => item.id === grade)?.title}, Class ${classNumber || '—'}`
                : 'the unassigned lessons group'}. Each class or learning path has its own order.
            </p>
          </div>

          <div>
            <label htmlFor="edit-task-prompt" className="mb-2 block font-semibold">Task prompt (English)</label>
            <textarea
              id="edit-task-prompt"
              lang="en"
              dir="ltr"
              translate="no"
              value={taskPrompt}
              onChange={(event) => setTaskPrompt(event.target.value)}
              maxLength={5000}
              rows={5}
              disabled={saving}
              className="w-full rounded-md border border-gray-300 bg-white p-3 text-left dark:border-gray-600 dark:bg-gray-700"
            />
          </div>

          <div>
            <label htmlFor="edit-max-score" className="mb-2 block font-semibold">Maximum task mark</label>
            <input
              id="edit-max-score"
              type="number"
              min="0.01"
              max="10000"
              step="0.01"
              value={maxScore}
              onChange={(event) => setMaxScore(event.target.value)}
              required
              disabled={saving}
              className="w-full rounded-md border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-grade" className="mb-2 block font-semibold">Learning path</label>
              <select
                id="edit-grade"
                value={grade}
                onChange={(event) => {
                  setGrade(isGradeId(event.target.value) ? event.target.value : '');
                  setClassNumber('');
                }}
                disabled={saving}
                className="w-full rounded-md border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="">{grade === 'english-foundation' ? 'No class needed' : 'Not assigned'}</option>
                {grades.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="edit-class-number" className="mb-2 block font-semibold">Class</label>
              <select
                id="edit-class-number"
                value={classNumber}
                onChange={(event) => setClassNumber(event.target.value)}
                disabled={saving || !grade || grade === 'english-foundation'}
                className="w-full rounded-md border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="">{grade === 'english-foundation' ? 'No class needed' : 'Not assigned'}</option>
                {grade && Array.from(
                  { length: grades.find((item) => item.id === grade)?.classCount ?? 0 },
                  (_, index) => <option key={index + 1} value={index + 1}>Class {index + 1}</option>,
                )}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="edit-video" className="mb-2 block font-semibold">Replace lesson video (optional)</label>
            <input
              id="edit-video"
              type="file"
              accept="video/mp4,video/webm"
              onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
              disabled={saving}
              className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-200 dark:file:bg-blue-950 dark:file:text-blue-200"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Leave this empty to keep the existing video. MP4 and WebM files up to 50 MB are supported.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving lesson...' : 'Save lesson details'}
          </button>
        </form>
      )}
    </main>
  );
}
