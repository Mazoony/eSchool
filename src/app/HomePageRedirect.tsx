'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function HomePageRedirect({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/lessons');
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <p className="p-8 text-center text-gray-600 dark:text-gray-300" role="status">
        {user ? 'Redirecting to your lessons...' : 'Loading...'}
      </p>
    );
  }

  return children;
}
