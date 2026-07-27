
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/solid';

const Breadcrumbs = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter((segment) => segment);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const name = segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;
    return { href, name, isLast };
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://eschool.com',
      },
      ...breadcrumbs.map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: breadcrumb.name,
        item: `https://eschool.com${breadcrumb.href}`,
      })),
    ],
  };

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
            <HomeIcon className="w-4 h-4 mr-2.5" />
            Home
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb) => (
          <li key={breadcrumb.href}>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
              <Link href={breadcrumb.href} className={`ml-1 text-sm font-medium ${breadcrumb.isLast ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white'}`}>
                {breadcrumb.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
