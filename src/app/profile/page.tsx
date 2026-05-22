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

    if (user) {
      router.push(`/profile/${user.id}`);
    } else {
      router.push('/');
    }
  }, [user, loading, router]);

  return <div>Redirecting...</div>;
}
