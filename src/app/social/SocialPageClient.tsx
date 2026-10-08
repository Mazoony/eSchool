'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import SocialFeed from '../components/SocialFeed';

export default function SocialPageClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [loading, user, router]);

  if (loading || !user) return <p className="p-8 text-center">Loading...</p>;
  return <SocialFeed />;
}
