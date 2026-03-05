'use client';

import Link from 'next/link';
import { HomeIcon, BellIcon, UserCircleIcon, CogIcon } from '@heroicons/react/24/outline';

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden z-50">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className="p-2">
          <HomeIcon className="h-7 w-7 text-gray-600 dark:text-gray-300" />
        </Link>
        <Link href="/notifications" className="p-2">
          <BellIcon className="h-7 w-7 text-gray-600 dark:text-gray-300" />
        </Link>
        <Link href="/profile" className="p-2">
          <UserCircleIcon className="h-7 w-7 text-gray-600 dark:text-gray-300" />
        </Link>
        <Link href="/settings" className="p-2">
          <CogIcon className="h-7 w-7 text-gray-600 dark:text-gray-300" />
        </Link>
      </div>
    </nav>
  );
}
