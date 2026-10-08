'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLesson, Lesson } from '../actions';
import LessonDetails from './LessonDetails';

export default function LessonPageClient({ lessonId }: { lessonId: string }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getLesson(lessonId)
      .then((result) => {
        if (active) setLesson(result);
      })
      .catch((loadError: unknown) => {
        console.error('Failed to load lesson:', loadError);
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load this lesson.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [lessonId]);

  if (loading) return <p className="p-8 text-center">Loading lesson...</p>;
  if (error) return <p className="p-8 text-center text-red-600" role="alert">{error}</p>;
  if (!lesson) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold mb-4">Lesson not found</h1>
        <Link href="/lessons" className="text-blue-600 hover:underline">Back to Lessons</Link>
      </main>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: lesson.title,
    description: lesson.description,
    provider: {
      '@type': 'Organization',
      name: 'eSchool',
      sameAs: 'https://eschool.com',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LessonDetails lesson={lesson} />
    </>
  );
}
