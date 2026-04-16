import { getLesson } from '../actions';
import Link from 'next/link';

export default async function LessonPage({ params }: { params: { id: string } }) {
  const lesson = await getLesson(params.id);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-50 mb-4">Lesson not found</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Sorry, we couldn't find the lesson you're looking for.</p>
        <Link href="/lessons" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Back to Lessons
        </Link>
      </div>
    );
  }

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
        <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-50 mb-12">{lesson.title}</h1>
        <div className="aspect-w-16 aspect-h-9 mb-8">
          <iframe
            src={lesson.video_url}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg shadow-lg"
          ></iframe>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">Description</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">{lesson.description}</p>
        </div>
      </div>
    </div>
  );
}
