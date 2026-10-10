'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../AuthContext';
import Notifications from './Notifications';
import { 
  HomeIcon, 
  BookOpenIcon,
  TrophyIcon,
  BellIcon, 
  UserCircleIcon, 
  PlusIcon, 
  ChatBubbleLeftEllipsisIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/solid';

export default function Header() {
  const { user, signOut, toastMessage } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex flex-col items-center p-2 sm:p-4">
        {toastMessage && (
          <div className="w-full mb-3 px-4 py-2 rounded-lg bg-green-500 text-white text-sm text-center shadow-md">
            {toastMessage}
          </div>
        )}
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {!user && (
              <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                eSchool 
              </Link>
            )}
          </div>

          {user ? (
          <>
            <nav className="flex flex-grow flex-wrap justify-center items-center gap-x-3 gap-y-2 sm:gap-x-6">
              <Link href="/social" aria-label="Home feed" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <HomeIcon className="h-7 w-7" />
              </Link>
              <Link href="/lessons" aria-label="Lessons" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <BookOpenIcon className="h-7 w-7" />
              </Link>
              <Link href="/leaderboard" className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 sm:flex-row sm:gap-1">
                <TrophyIcon className="h-6 w-6" />
                <span className="text-[10px] font-medium sm:text-sm">Leaderboard</span>
              </Link>
              <Notifications />
              <Link href={`/profile/${user.id}`} aria-label="Your profile" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <UserCircleIcon className="h-7 w-7" />
              </Link>
               <Link href="/settings" aria-label="Settings" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <CogIcon className="h-7 w-7" />
              </Link>
              <button onClick={handleLogout} aria-label="Sign out" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <ArrowLeftOnRectangleIcon className="h-7 w-7" />
              </button>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
                <button aria-label="Create a post" className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
                    <PlusIcon className="h-6 w-6" />
                </button>
                <button aria-label="Messages" className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
                    <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
                </button>
              <Link href={`/profile/${user.id}`} className="flex items-center space-x-3">
                <Image
                  src={user.profile?.avatar_url || user.photoURL || '/user.svg'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer"
                  width={40}
                  height={40}
                />
                <span className="hidden sm:inline-block font-medium text-gray-900 dark:text-gray-100">{user.profile?.full_name || user.displayName || user.email}</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/leaderboard"
              className="flex items-center gap-1 font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
            >
              <TrophyIcon className="h-5 w-5" aria-hidden="true" />
              <span>Leaderboard</span>
            </Link>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
    </header>
  );
}
