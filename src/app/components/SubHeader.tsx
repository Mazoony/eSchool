'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SubHeader = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/lessons', label: 'Lessons' },
    { href: '/', label: 'Social Feed' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                pathname === item.href
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubHeader;
