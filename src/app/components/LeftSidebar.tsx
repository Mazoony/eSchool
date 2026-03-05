'use client';

import Link from 'next/link';
import { supabase } from '../supabase';
import { HomeIcon, BellIcon, UserCircleIcon, CogIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../AuthContext';
import Image from 'next/image';

export default function LeftSidebar() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const placeholderAvatar = '/user.svg';

  return (
    <aside className="hidden lg:block w-64 p-6 bg-white dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700">
      <div className="space-y-6">
        <h2 className="font-bold text-2xl text-gray-900 dark:text-gray-100">Your Feed</h2>
        <nav className="space-y-2">
          <Link href="/" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <HomeIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            <span className="font-semibold text-gray-700 dark:text-gray-200">Home</span>
          </Link>
          <Link href="/notifications" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            <span className="font-semibold text-gray-700 dark:text-gray-200">Notifications</span>
          </Link>
          <Link href="/profile" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <UserCircleIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            <span className="font-semibold text-gray-700 dark:text-gray-200">Profile</span>
          </Link>
          <Link href="/settings" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <CogIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            <span className="font-semibold text-gray-700 dark:text-gray-200">Settings</span>
          </Link>
        </nav>
        <div className="absolute bottom-0 left-0 w-64 p-6">
          {user && (
            <div className="flex items-center space-x-3 mb-4">
              <Image 
                src={user.user_metadata.avatar_url || placeholderAvatar} 
                alt="User avatar" 
                width={40} 
                height={40} 
                className="rounded-full"
              />
              <span className="font-semibold text-gray-700 dark:text-gray-200">{user.user_metadata.full_name || user.email}</span>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center space-x-3 p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
