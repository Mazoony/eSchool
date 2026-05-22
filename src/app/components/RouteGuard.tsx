'use client';

import { useAuth } from '../AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const allowedPublicPaths = ['/', '/login', '/register', '/forgot-password'];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // If user is not logged in and trying to access a protected route
      if (!user && !allowedPublicPaths.includes(pathname) && !pathname.startsWith('/auth/')) {
        router.push('/');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <>{children}</>;
}
