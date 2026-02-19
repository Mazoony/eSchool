'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';
import SocialFeed from '../components/SocialFeed';

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const lessonsCollection = collection(firestore, 'lessons');
        const lessonSnapshot = await getDocs(lessonsCollection);
        const lessonsList = lessonSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Lesson[];
        setLessons(lessonsList);
      } catch (err) {
        setError('Failed to fetch lessons.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-50 mb-8">Lessons</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lessons.map(lesson => (
            <div key={lesson.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <video controls className="w-full h-48 object-cover">
                <source src={lesson.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">{lesson.title}</h2>
                <p className="text-gray-700 dark:text-gray-300">{lesson.description}</p>
              </div>
              <SocialFeed lessonId={lesson.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
