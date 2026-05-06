'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../AuthContext';
import { User } from '../types';
import Notifications from './Notifications';
import { 
  HomeIcon, 
  BookOpenIcon,
  BellIcon, 
  UserCircleIcon, 
  PlusIcon, 
  ChatBubbleLeftEllipsisIcon,
  CogIcon
} from '@heroicons/react/24/solid';

export default function Header() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center p-2 sm:p-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            eSchool
          </Link>
        </div>

        {user ? (
          <>
            <nav className="hidden md:flex flex-grow justify-center items-center space-x-6 sm:space-x-10">
              <Link href="/social" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <HomeIcon className="h-7 w-7" />
              </Link>
              <Link href="/lessons" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <BookOpenIcon className="h-7 w-7" />
              </Link>
              <Notifications />
              <Link href={`/profile/${user.id}`} className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <UserCircleIcon className="h-7 w-7" />
              </Link>
               <Link href="/settings" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <CogIcon className="h-7 w-7" />
              </Link>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
                <button className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
                    <PlusIcon className="h-6 w-6" />
                </button>
                <button className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
                    <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
                </button>
              <Link href={`/profile/${user.id}`}>
                <Image
                  src={(user as User).profile?.avatar_url || '/user.svg'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer"
                  width={40}
                  height={40}
                />
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-4">
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
    </header>
  );
}
