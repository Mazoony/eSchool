import { createClient } from '@/utils/supabase/client';
import { GradeId, isGradeId } from './curriculum';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  created_at: string;
  slug: string;
  grade: GradeId | null;
  class_number: number | null;
  display_order: number;
  task_prompt: string | null;
  task_max_score: number;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');

function storagePath(videoUrl: string): string | null {
  if (!videoUrl) return null;
  if (!videoUrl.startsWith('http')) return videoUrl;
  try {
    const url = new URL(videoUrl);
    const marker = '/storage/v1/object/';
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex < 0) return null;
    const objectPath = url.pathname.slice(markerIndex + marker.length);
    const [accessType, bucket, ...segments] = objectPath.split('/');
    if (!['public', 'sign'].includes(accessType)) return null;
    return bucket === 'videos' ? decodeURIComponent(segments.join('/')) : null;
  } catch {
    return null;
  }
}

async function signedVideoUrl(videoUrl: string): Promise<string> {
  const path = storagePath(videoUrl);
  if (!path) return videoUrl;
  const { data, error } = await createClient().storage.from('videos').createSignedUrl(path, 60 * 60);
  if (error) throw new Error(`Could not create a signed lesson video URL: ${error.message}`);
  return data.signedUrl;
}

const lessonSelection = 'id, title, description, video_url, created_at, grade, class_number, display_order, task_prompt, task_max_score';

async function mapLessons(
  rows: Array<Record<string, unknown>>,
  signVideos: boolean,
): Promise<Lesson[]> {
  return Promise.all(rows.map(async (row, index) => {
    const title = typeof row.title === 'string' ? row.title : `Lesson ${index + 1}`;
    const grade = typeof row.grade === 'string' && isGradeId(row.grade) ? row.grade : null;
    const classNumber = typeof row.class_number === 'number' && Number.isInteger(row.class_number)
      ? row.class_number
      : null;
    const videoUrl = typeof row.video_url === 'string' ? row.video_url : '';
    return {
      id: String(row.id),
      title,
      description: typeof row.description === 'string' ? row.description : '',
      video_url: signVideos ? await signedVideoUrl(videoUrl) : videoUrl,
      created_at: typeof row.created_at === 'string' ? row.created_at : new Date(0).toISOString(),
      slug: slugify(title) || `lesson-${index + 1}`,
      grade,
      class_number: grade ? classNumber : null,
      display_order: Number(row.display_order),
      task_prompt: typeof row.task_prompt === 'string' ? row.task_prompt : null,
      task_max_score: Number(row.task_max_score),
    };
  }));
}

async function readLessons(grade?: GradeId, classNumber?: number, signVideos = true): Promise<Lesson[]> {
  let query = createClient()
    .from('lessons')
    .select(lessonSelection)
    .order('grade', { ascending: true, nullsFirst: true })
    .order('class_number', { ascending: true, nullsFirst: true })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (grade) query = query.eq('grade', grade);
  if (grade === 'english-foundation') query = query.is('class_number', null);
  else if (grade && classNumber !== undefined) query = query.eq('class_number', classNumber);

  const { data, error } = await query;
  if (error) throw new Error(`Could not load lessons: ${error.message}`);
  return mapLessons((data ?? []) as Array<Record<string, unknown>>, signVideos);
}

export async function getLessons(grade?: GradeId, classNumber?: number): Promise<Lesson[]> {
  return readLessons(grade, classNumber);
}

export async function getClassLessons(grade: GradeId, classNumber?: number): Promise<Lesson[]> {
  return readLessons(grade, classNumber, false);
}

export async function getSignedLessonVideoUrl(videoUrl: string): Promise<string> {
  return signedVideoUrl(videoUrl);
}

export async function getLesson(id?: string | null): Promise<Lesson | null> {
  if (!id) return null;
  const normalizedId = id.toLowerCase();
  const lessons = await readLessons(undefined, undefined, false);
  const lesson = lessons.find((lesson) =>
    lesson.id.toLowerCase() === normalizedId ||
    lesson.slug === normalizedId ||
    lesson.title.toLowerCase() === normalizedId,
  ) ?? null;
  return lesson
    ? { ...lesson, video_url: await signedVideoUrl(lesson.video_url) }
    : null;
}
