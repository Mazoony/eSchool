
import Link from 'next/link';
import { getLessons } from './actions';

export default async function LessonsPage() {
  const lessons = await getLessons();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <header className="px-4 lg:px-6 h-16 flex items-center bg-white dark:bg-gray-800 shadow-md">
          <Link href="/" className="flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">eSchool</span>
          </Link>
          <nav className="ml-auto flex gap-6 sm:gap-8">
            <Link href="/lessons" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
              Lessons
            </Link>
            <Link href="/social" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
              Social
            </Link>
            <Link href="/profile" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
              Profile
            </Link>
          </nav>
        </header>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-50 mb-12">Our Lessons</h1>
        {lessons.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-900/30 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mb-4">No Lessons Found</h2>
            <p className="text-lg">
              There are no lessons available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {lessons.map((lesson: any, index: number) => (
            <Link href={`/lessons/${lesson.id}`} key={lesson.id || index}>
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
