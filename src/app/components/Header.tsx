'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../AuthContext';
import { User } from '../types';
import Notifications from './Notifications';
import { 
  HomeIcon, 
  UserGroupIcon, 
  PlayCircleIcon, 
  BellIcon, 
  UserCircleIcon, 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ChatBubbleLeftEllipsisIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/solid';

export default function Header() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto flex justify-between items-center p-2 sm:p-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            eSchool
          </Link>
          <div className="relative hidden sm:block">
            <MagnifyingGlassIcon className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search eSchool"
              className="bg-gray-100 dark:bg-gray-700 rounded-full py-2 pl-10 pr-4 w-40 sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {user ? (
          <>
            <nav className="hidden md:flex flex-grow justify-center items-center space-x-2 sm:space-x-6">
              <Link href="/social" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <HomeIcon className="h-7 w-7" />
              </Link>
              <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <UserGroupIcon className="h-7 w-7" />
              </Link>
              <Link href="/lessons" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                <PlayCircleIcon className="h-7 w-7" />
              </Link>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
                <button className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
                    <PlusIcon className="h-6 w-6" />
                </button>
                <button className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
                    <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
                </button>
              <Notifications />
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
