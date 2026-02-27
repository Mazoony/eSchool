'use client';

import { useAuth } from '../AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const allowedPaths = ['/', '/login', '/register'];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user && !allowedPaths.includes(pathname)) {
        router.push('/');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return <>{children}</>;
}
