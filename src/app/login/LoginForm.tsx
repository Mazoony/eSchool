'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAuth } from "../AuthContext";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginForm({
  embedded = false,
  onSwitchToSignUp,
}: {
  embedded?: boolean;
  onSwitchToSignUp?: () => void;
} = {}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [callbackError, setCallbackError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading, error: authError, signIn } = useAuth();

  useEffect(() => {
    try {
      const savedEmail = window.localStorage.getItem('eschool:login-email');
      if (savedEmail) setEmail(savedEmail);
    } catch (storageError: unknown) {
      console.error('Could not restore the saved login email:', storageError);
    }
  }, []);

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get('authError');
    if (error === 'provider') {
      setCallbackError('Google sign-in was not completed. Check that Google is enabled in Supabase and that its redirect URL is configured.');
    } else if (error === 'exchange-failed') {
      setCallbackError('Google accepted the sign-in, but Supabase could not finish the session. Please try again or check the Supabase callback settings.');
    } else if (error === 'missing-code') {
      setCallbackError('Google did not return a sign-in code. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/lessons');
    }
  }, [user, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      await signIn({ email, password });
      try {
        window.localStorage.setItem('eschool:login-email', email.trim());
      } catch (storageError: unknown) {
        console.error('Could not save the login email:', storageError);
      }
      // Redirect is handled by the useEffect above
    } catch (err: any) {
      setFormError(err.message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
        <div className={embedded
          ? 'flex flex-col items-center justify-center py-8'
          : 'flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900'}
        >
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-50">Loading...</h1>
            {authError && <p className="mt-4 text-sm text-red-600">{authError}</p>}
        </div>
    );
  }

  return (
    <div className={embedded ? 'w-full' : 'flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900'}>
      <div className={embedded
        ? 'mx-auto w-full max-w-md'
        : 'w-full max-w-md rounded-lg bg-white px-8 py-10 shadow-md dark:bg-gray-800'}
      >
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-50">Log In to eSchool</h1>
        {authError && <p className="mt-4 text-center text-sm text-red-600">{authError}</p>}
        {callbackError && <p className="mt-4 text-center text-sm text-red-600" role="alert">{callbackError}</p>}
        <form onSubmit={handleEmailLogin} autoComplete="on" className="mt-8 space-y-6">
            <label htmlFor="login-email" className="sr-only">Email address</label>
            <input
              id="login-email"
              name="username"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-gray-300"
              disabled={isSubmitting}
            />
            <div className="relative">
              <label htmlFor="login-password" className="sr-only">Password</label>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-4 py-2 mt-4 text-gray-700 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-gray-300"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 mt-4 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}
        <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          {embedded && onSwitchToSignUp ? (
            <button type="button" onClick={onSwitchToSignUp} className="font-medium text-blue-600 hover:underline">
              Sign up
            </button>
          ) : (
            <Link href="/register" className="font-medium text-blue-600 hover:underline">
              Sign up
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}
