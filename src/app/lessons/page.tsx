
import { supabase } from '../supabase';
import Link from 'next/link';

interface Lesson {
  id: number;
  title: string;
  description: string;
  video_url: string;
}

async function fetchLessons(): Promise<Lesson[]> {
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('*');

  if (error) {
    console.error('Error fetching lessons:', error);
    // Return an empty array, the UI will show a helpful message
    return [];
  }

  return lessons || [];
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
          <div className="text-center text-gray-500 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-900/30 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mb-4">No Lessons Found</h2>
            <p className="text-lg">
              If you have already uploaded lessons, they might not be appearing because of Supabase's Row Level Security (RLS).
            </p>
            <p className="mt-4">
              <strong>To fix this, you need to create a security policy to allow read access.</strong>
            </p>
            <div className="mt-6 text-left bg-gray-800 text-white p-4 rounded-md font-mono">
                <p className="font-semibold">Follow these steps in your Supabase project:</p>
                <ol className="list-decimal list-inside mt-2 space-y-2">
                    <li>Go to the <strong>SQL Editor</strong> section.</li>
                    <li>Click <strong>"New query"</strong>.</li>
                    <li>Paste the following SQL code and click <strong>"RUN"</strong>:</li>
                    <li className="mt-4 p-4 bg-gray-700 rounded-md">
                      <code>
                        CREATE POLICY "Enable read access for all users" <br/>
                        ON public.lessons <br/>
                        FOR SELECT <br/>
                        USING (true);
                      </code>
                    </li>
                </ol>
            </div>
            <p className="mt-6">After running the query, refresh this page to see your lessons.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {lessons.map(lesson => (
              <div key={lesson.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105 duration-300">
                <div className="aspect-w-16 aspect-h-9">
                  <video controls className="w-full h-full object-cover">
                    <source src={lesson.video_url} type="video/mp4" />
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
