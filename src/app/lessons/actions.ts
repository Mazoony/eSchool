import { collection, getDocs, query, Timestamp } from 'firebase/firestore';
import { getFirebaseServices } from '@/utils/firebase/client';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  created_at: string;
  slug: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');

const toIsoString = (value: unknown): string => {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return new Date(0).toISOString();
};

async function readLessons(): Promise<Lesson[]> {
  const { db } = getFirebaseServices();
  const snapshot = await getDocs(query(collection(db, 'lessons')));
  return snapshot.docs.map((item, index) => {
    const data = item.data();
    const title = typeof data.title === 'string' ? data.title : `Lesson ${index + 1}`;
    return {
      id: item.id,
      title,
      description: typeof data.description === 'string' ? data.description : '',
      video_url: typeof data.video_url === 'string' ? data.video_url : '',
      created_at: toIsoString(data.created_at),
      slug: slugify(title) || `lesson-${index + 1}`,
    };
  });
}

export async function getLessons(): Promise<Lesson[]> {
  return readLessons();
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
