
'use client';

import { useAuth } from '../AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function UserHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          eSchool
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href={`/profile/${user.id}`} className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                <Image 
                  src={user.user_metadata.avatar_url || 'https://i.pravatar.cc/40'} 
                  alt="User avatar" 
                  width={40} 
                  height={40} 
                  className="rounded-full w-10 h-10 object-cover border-2 border-gray-300 dark:border-gray-600" 
                />
                <span className="hidden sm:inline font-medium">{user.user_metadata.full_name || user.email}</span>
              </Link>
              <button 
                onClick={signOut}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <Link href="/login" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
