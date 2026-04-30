'use server';

import { createClient } from "@/utils/supabase/server";

export interface Lesson {
  id?: string;
  title: string;
  description: string;
  video_url: string;
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

const parseVideoPath = (videoUrl: string): { bucket: string; path: string } | null => {
  try {
    const url = new URL(videoUrl);
    const signMatch = url.pathname.match(/^\/storage\/v1\/object\/sign\/([^/]+)\/(.+)$/);
    const publicMatch = url.pathname.match(/^\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);

    if (signMatch) {
      return { bucket: signMatch[1], path: decodeURIComponent(signMatch[2]) };
    }
    if (publicMatch) {
      return { bucket: publicMatch[1], path: decodeURIComponent(publicMatch[2]) };
    }

    return null;
  } catch (error) {
    const normalizedPath = videoUrl.replace(/^\/+/, '');
    if (!normalizedPath || normalizedPath.includes('://')) {
      return null;
    }

    return { bucket: 'videos', path: normalizedPath };
  }
};

const isFullUrl = (videoUrl: string) => /^(https?:)?\/\//.test(videoUrl) || videoUrl.startsWith('/storage/v1/object');

const migrateVideoUrlToStablePath = async (supabase: any, lesson: any) => {
  if (!lesson?.video_url || !isFullUrl(lesson.video_url)) {
    return lesson;
  }

  const parsed = parseVideoPath(lesson.video_url);
  if (!parsed || parsed.bucket !== 'videos') {
    return lesson;
  }

  const stablePath = parsed.path;
  try {
    const matchObj: any = { video_url: lesson.video_url };
    if (lesson.title) {
      matchObj.title = lesson.title;
    }

    const { error: updateError } = await supabase
      .from('lessons')
      .update({ video_url: stablePath })
      .match(matchObj);

    if (updateError) {
      console.warn('Could not migrate lesson video_url to stable path:', updateError);
    }
  } catch (error) {
    console.warn('Error migrating lesson video_url to stable path:', error);
  }

  return { ...lesson, video_url: stablePath };
};

const normalizeVideoUrl = async (supabase: any, videoUrl: string): Promise<string> => {
  if (!videoUrl) {
    return videoUrl;
  }

  const parsed = parseVideoPath(videoUrl);
  if (!parsed) {
    return videoUrl;
  }

  const { bucket, path } = parsed;
  const { data: publicData, error: publicError } = await supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  if (!publicError && publicData?.publicUrl) {
    return publicData.publicUrl;
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60);

  if (!signedError && signedData?.signedUrl) {
    return signedData.signedUrl;
  }

  return videoUrl;
};

export async function getLessons() {
  const supabase = await createClient();
  const { data: lessons, error } = await supabase.from('lessons').select('*');

  if (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }

  return await Promise.all(
    (lessons || []).map(async (lesson: any, index: number) => {
      const stableLesson = await migrateVideoUrlToStablePath(supabase, lesson);
      const generatedSlug = slugify(stableLesson.title || `lesson-${index + 1}`);
      return {
        ...stableLesson,
        video_url: await normalizeVideoUrl(supabase, stableLesson.video_url),
        slug: generatedSlug || `lesson-${index + 1}`,
      };
    })
  );
}

export async function getLesson(id?: string | null) {
  if (!id) {
    console.error('getLesson called without an id');
    return null;
  }

  const normalizedId = id.toString().toLowerCase();
  const supabase = await createClient();
  const { data: lessons, error } = await supabase.from('lessons').select('*');

  if (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }

  const lesson = (lessons || []).find((item: any) => {
    const itemSlug = slugify(item.title || '');
    const itemId = item.id?.toString().toLowerCase() ?? '';
    const normalizedTitle = item.title?.toString().toLowerCase() ?? '';
    return itemId === normalizedId || itemSlug === normalizedId || normalizedTitle === normalizedId;
  });

  if (!lesson) {
    console.error('Lesson not found for id/slug:', id);
    return null;
  }

  const stableLesson = await migrateVideoUrlToStablePath(supabase, lesson);
  return {
    ...stableLesson,
    video_url: await normalizeVideoUrl(supabase, stableLesson.video_url),
    slug: slugify(stableLesson.title || ''),
  } as Lesson;
}
