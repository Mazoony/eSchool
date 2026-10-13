'use client';

import { useEffect, useState } from 'react';
import LoginForm from '../login/LoginForm';
import RegisterForm from '../register/RegisterForm';

type FormMode = 'login' | 'signup';

export default function HomeAuthPanel() {
  const [mode, setMode] = useState<FormMode>('signup');

  useEffect(() => {
    try {
      if (window.localStorage.getItem('eschool-has-account') === 'true') {
        setMode('login');
      }
    } catch (storageError: unknown) {
      console.error('Could not load the home-page sign-in preference:', storageError);
    }
  }, []);

  const selectMode = (nextMode: FormMode) => {
    setMode(nextMode);
    try {
      if (nextMode === 'login') {
        window.localStorage.setItem('eschool-has-account', 'true');
      } else {
        window.localStorage.removeItem('eschool-has-account');
      }
    } catch (storageError: unknown) {
      console.error('Could not save the home-page sign-in preference:', storageError);
    }
  };

  return (
    <section id="get-started" className="bg-blue-50 px-4 py-12 dark:bg-gray-900 sm:py-16">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-5 shadow-xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 sm:p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Join eSchool</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Create an account to start learning, or log in to continue your lessons.
          </p>
        </div>

        <div className="mx-auto mt-6 grid max-w-md grid-cols-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-700" role="tablist" aria-label="Account access">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            onClick={() => selectMode('signup')}
            className={`rounded-md px-4 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              mode === 'signup'
                ? 'bg-white text-blue-700 shadow dark:bg-gray-600 dark:text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Sign up
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => selectMode('login')}
            className={`rounded-md px-4 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              mode === 'login'
                ? 'bg-white text-blue-700 shadow dark:bg-gray-600 dark:text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            Log in
          </button>
        </div>

        <div className="mx-auto mt-6 max-w-md" role="tabpanel">
          {mode === 'signup' ? (
            <RegisterForm
              embedded
              onSwitchToLogin={() => selectMode('login')}
            />
          ) : (
            <LoginForm
              embedded
              onSwitchToSignUp={() => selectMode('signup')}
            />
          )}
        </div>
        <p className="mx-auto mt-5 max-w-md text-center text-xs text-gray-500 dark:text-gray-400">
          Your email is remembered on this device. Save your password in your browser&apos;s password manager to sign in with one click. eSchool never stores your password.
        </p>
      </div>
    </section>
  );
}
