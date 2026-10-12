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

async function readLessons(): Promise<Lesson[]> {
  const { data, error } = await createClient()
    .from('lessons')
    .select('id, title, description, video_url, created_at, grade, class_number, display_order, task_prompt, task_max_score')
    .order('grade', { ascending: true, nullsFirst: true })
    .order('class_number', { ascending: true, nullsFirst: true })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Could not load lessons: ${error.message}`);

  return Promise.all((data ?? []).map(async (row, index) => {
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
      video_url: await signedVideoUrl(videoUrl),
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

export async function getLessons(grade?: GradeId, classNumber?: number): Promise<Lesson[]> {
  const lessons = await readLessons();
  if (!grade) return lessons;
  if (grade === 'english-foundation') {
    return lessons.filter((lesson) =>
      lesson.grade === grade && lesson.class_number === null,
    );
  }
  if (classNumber === undefined) return lessons;
  return lessons.filter((lesson) => lesson.grade === grade && lesson.class_number === classNumber);
}

export async function getLesson(id?: string | null): Promise<Lesson | null> {
  if (!id) return null;
  const normalizedId = id.toLowerCase();
  const lessons = await readLessons();
  return lessons.find((lesson) =>
    lesson.id.toLowerCase() === normalizedId ||
    lesson.slug === normalizedId ||
    lesson.title.toLowerCase() === normalizedId,
  ) ?? null;
}
