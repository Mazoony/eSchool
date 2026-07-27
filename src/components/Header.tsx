
'use client';

import { useAuth } from '../app/AuthContext';
import Link from 'next/link';
import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Social', href: '/social' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <Disclosure as="nav" className="bg-white dark:bg-gray-800 shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                    eSchool
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          'text-gray-500 hover:bg-gray-700 hover:text-white',
                          'rounded-md px-3 py-2 text-sm font-medium'
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <button
                    type="button"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                >
                    <span className="sr-only">Toggle dark mode</span>
                    {theme === 'dark' ? (
                        <SunIcon className="h-6 w-6" aria-hidden="true" />
                    ) : (
                        <MoonIcon className="h-6 w-6" aria-hidden="true" />
                    )}
                </button>

                {/* Profile dropdown */}
                {user ? (
                    <Menu as="div" className="relative ml-3">
                        <div>
                        <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                            <span className="sr-only">Open user menu</span>
                            <img
                            className="h-8 w-8 rounded-full"
                            src={user.user_metadata.avatar_url || 'https://www.gravatar.com/avatar/'}
                            alt=""
                            />
                        </Menu.Button>
                        </div>
                        <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                        >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                            {({ active }) => (
                                <Link
                                href={`/profile/${user.id}`}
                                className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                                >
                                Your Profile
                                </Link>
                            )}
                            </Menu.Item>
                            <Menu.Item>
                            {({ active }) => (
                                <button
                                onClick={signOut}
                                className={classNames(active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700')}
                                >
                                Sign out
                                </button>
                            )}
                            </Menu.Item>
                        </Menu.Items>
                        </Transition>
                    </Menu>
                    ) : (
                    <div className="hidden sm:flex sm:items-center sm:ml-6">
                        <Link href="/login" className="text-gray-500 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                            Log In
                        </Link>
                        <Link href="/register" className="ml-4 text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                            Register
                        </Link>
                    </div>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    'text-gray-500 hover:bg-gray-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {!user && (
                <>
                    <Disclosure.Button
                        as="a"
                        href="/login"
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-700 hover:text-white"
                    >
                        Log In
                    </Disclosure.Button>
                    <Disclosure.Button
                        as="a"
                        href="/register"
                        className="block rounded-md px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Register
                    </Disclosure.Button>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
