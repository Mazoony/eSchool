'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

export default function ProfileRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(`/profile/${user.id}`);
    } else {
      router.push('/');
    }
  }, [user, router]);

  return <div>Redirecting...</div>;
}
