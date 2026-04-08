
'use client';

import { AuthProvider } from '../AuthContext';
import SocialFeed from '../components/SocialFeed';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserHeader from '../components/UserHeader';

function DashboardContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <UserHeader />
      <div className="container mx-auto p-4">
        <SocialFeed />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
