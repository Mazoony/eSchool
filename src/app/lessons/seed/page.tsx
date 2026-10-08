'use client';

import { useState } from 'react';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { useAuth } from '../../AuthContext';
import { getFirebaseServices } from '@/utils/firebase/client';

const lessons = [
  { title: 'Introduction to Programming', description: 'Learn the fundamentals of programming, including variables, data types, and control structures.' },
  { title: 'Web Development Basics', description: 'An introduction to HTML, CSS, and JavaScript, the core technologies for building websites.' },
  { title: 'Advanced JavaScript', description: 'Dive deeper into JavaScript and learn about concepts like closures, promises, and async/await.' },
  { title: 'React for Beginners', description: 'Learn the basics of React, a popular JavaScript library for building user interfaces.' },
  { title: 'State Management with Redux', description: 'Master state management in React applications with Redux.' },
  { title: 'Building APIs with Node.js', description: 'Learn how to build robust and scalable APIs using Node.js and Express.' },
  { title: 'Database Design and SQL', description: 'Understand the principles of database design and learn how to write SQL queries.' },
  { title: 'Introduction to Python', description: 'A beginner-friendly introduction to Python, a versatile and powerful programming language.' },
  { title: 'Data Science with Pandas', description: 'Learn how to use the Pandas library in Python for data manipulation and analysis.' },
];

export default function SeedPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const seedLessons = async () => {
    if (user?.email !== 'wadareaf@gmail.com') {
      setError('Only the site administrator can seed lesson data.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const { db } = getFirebaseServices();
      const existing = await getDocs(collection(db, 'lessons'));
      for (let offset = 0; offset < existing.docs.length; offset += 450) {
        const batch = writeBatch(db);
        existing.docs.slice(offset, offset + 450).forEach((item) => batch.delete(item.ref));
        await batch.commit();
      }
      const batch = writeBatch(db);
      lessons.forEach((lesson) => {
        batch.set(doc(collection(db, 'lessons')), {
          ...lesson,
          video_url: '',
          created_at: new Date(),
        });
      });
      await batch.commit();
      setMessage('Lessons seeded successfully.');
    } catch (seedError: unknown) {
      console.error('Error seeding lessons:', seedError);
      setError(seedError instanceof Error ? seedError.message : 'Failed to seed lessons.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">Seed Database</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Click the button below to replace the lesson collection with initial lesson data.
        </p>
        {user?.email === 'wadareaf@gmail.com' ? (
          <button
            type="button"
            onClick={seedLessons}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {loading ? 'Seeding...' : 'Seed Lessons'}
          </button>
        ) : <p className="text-red-600">Administrator access required.</p>}
        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    </div>
  );
}
