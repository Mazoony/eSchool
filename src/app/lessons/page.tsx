
import Link from 'next/link';
import { getLessons } from './actions';
import { createMetadata } from '../metadata';

export const metadata = createMetadata({
  title: 'eSchool - English Lessons for Sudanese Students',
  description: 'Explore our comprehensive English lessons designed for Sudanese students. From beginner to advanced, find the right course to improve your language skills.',
  path: '/lessons',
});

export default async function LessonsPage() {
  const lessons = await getLessons();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-50 mb-12">Our English Lessons</h1>
        {lessons.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-900/30 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mb-4">No Lessons Found</h2>
            <p className="text-lg">
              There are no lessons available at the moment. Please check back later for updates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {lessons.map((lesson: any, index: number) => (
            <Link href={`/lessons/${lesson.slug}`} key={lesson.slug || lesson.id || index}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105 duration-300">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">{lesson.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{lesson.description}</p>
                </div>
              </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
