'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../AuthContext';
import { auth } from '../auth';

export default function Header() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="text-2xl font-bold">
          eSchool
        </Link>
        <nav className="hidden md:flex space-x-4">
          <Link href="/" className="hover:text-gray-400">
            Home
          </Link>
          <Link href="/lessons" className="hover:text-gray-400">
            Lessons
          </Link>
          <Link href="/quiz" className="hover:text-gray-400">
            Quiz
          </Link>
          <Link href="/learning-path" className="hover:text-gray-400">
            Learning Path
          </Link>
          <Link href="/progress" className="hover:text-gray-400">
            Progress
          </Link>
          <Link href="/social" className="hover:text-gray-400">
            Social Feed
          </Link>
          <Link href="/admin" className="hover:text-gray-400">
            Admin
          </Link>
        </nav>
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="font-semibold">{user.displayName}</span>
            <Image
              src={user.photoURL || '/placeholder.svg'}
              alt="Profile"
              className="w-10 h-10 rounded-full"
              width={40}
              height={40}
            />
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
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
