'use client';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Profile() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white dark:bg-gray-800">
        <Link href="#" className="flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">eSchool</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-400">
            Home
          </Link>
          <Link href="/lessons" className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-400">
            Lessons
          </Link>
          <Link href="/social" className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-400">
            Social
          </Link>
          <Link href="/profile" className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-400">
            Profile
          </Link>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">Profile</h1>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-800 p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img src={user.photoURL || 'https://www.gravatar.com/avatar/'} alt="User avatar" className="w-16 h-16 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">{user.displayName}</h2>
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full py-2 px-4 mt-4 font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
