'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VideoLessonList, { LessonVideoProps } from '../components/VideoLessonList';
import { getLessons } from '../lessons/actions';
import { useAuth } from '../AuthContext';

export default function VideosClient() {
  const [lessons, setLessons] = useState<LessonVideoProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    let active = true;
    getLessons()
      .then((results) => {
        if (active) {
          setLessons(results.map((lesson) => ({
            id: lesson.id,
            slug: lesson.slug,
            title: lesson.title,
            description: lesson.description,
            video_url: lesson.video_url,
          })));
        }
      })
      .catch((loadError: unknown) => {
        console.error('Failed to load video lessons:', loadError);
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load video lessons.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authLoading, user]);

  if (authLoading || !user) {
    return <p className="p-8 text-center">Checking your sign-in...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Video Lessons</h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            Watch lessons pulled directly from the database.
          </p>
        </div>
        {loading ? <p className="text-center">Loading lessons...</p>
          : error ? <p className="text-center text-red-600" role="alert">{error}</p>
            : <VideoLessonList lessons={lessons} />}
      </div>
    </div>
  );
}
