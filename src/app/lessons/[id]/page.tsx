'use client';

import { useParams } from 'next/navigation';
import LessonDetails from './LessonDetails';

export default function LessonPage() {
  const params = useParams();
  const lessonId = params?.id;

  if (!lessonId) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-50 mb-4">Lesson not found</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">No lesson identifier was provided in the route.</p>
      </div>
    );
  }

  return <LessonDetails lessonId={lessonId} />;
}
