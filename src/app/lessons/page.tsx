
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';
import Link from 'next/link';

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
}

async function fetchLessons() {
  try {
    const lessonsCollection = collection(firestore, 'lessons');
    const lessonSnapshot = await getDocs(lessonsCollection);
    const lessonsList = lessonSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Lesson[];
    return lessonsList;
  } catch (err) {
    console.error('Failed to fetch lessons:', err);
    // In a real app, you might want to log this to a service
    // and return an empty array or throw an error to be caught by an error boundary.
    return [];
  }
}

export default async function LessonsPage() {
  const lessons = await fetchLessons();

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
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg">No lessons have been uploaded yet.</p>
            <p className="mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {lessons.map(lesson => (
              <div key={lesson.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105 duration-300">
                <div className="aspect-w-16 aspect-h-9">
                  <video controls className="w-full h-full object-cover">
                    <source src={lesson.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">{lesson.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{lesson.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
