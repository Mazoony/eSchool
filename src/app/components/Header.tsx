'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../AuthContext';
import { User } from '../types';

export default function Header() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="text-2xl font-bold">
          eSchool
        </Link>
        {user ? (
          <>
            <nav className="hidden md:flex space-x-4">
              <Link href="/lessons" className="hover:text-gray-400">
                Lessons
              </Link>
              <Link href="/social" className="hover:text-gray-400">
                Social Feed
              </Link>
              <Link href={`/profile/${user.id}`} className="hover:text-gray-400">
                Profile
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href={`/profile/${user.id}`} className="font-semibold hover:text-gray-400">
                {user.email}
              </Link>
              <Link href={`/profile/${user.id}`}>
                <Image
                  src={(user as User).profile?.avatar_url || '/user.svg'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer"
                  width={40}
                  height={40}
                />
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
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
