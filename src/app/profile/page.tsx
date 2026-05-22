'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

export default function ProfileRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (user?.id) {
      // Redirect to the user's specific profile page
      router.push(`/profile/${user.id}`);
    } else {
      // No user after loading is done, redirect to landing page
      // But wait a moment in case the auth listener is still syncing
      const timeout = setTimeout(() => {
        router.push('/');
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
