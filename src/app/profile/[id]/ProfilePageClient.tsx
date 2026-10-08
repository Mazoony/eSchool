'use client';

import { useEffect, useState } from 'react';
import { getProfile } from '@/utils/firebase/data';
import { useAuth } from '../../AuthContext';
import ProfileClient from './ProfileClient';
import { Profile } from '../../types';

export default function ProfilePageClient({ profileId }: { profileId: string }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (authLoading) return;

    setLoading(true);
    setError(null);
    getProfile(profileId)
      .then((result) => {
        if (active) setProfile(result);
      })
      .catch((loadError: unknown) => {
        console.error('Failed to load profile:', loadError);
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load profile.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [profileId, authLoading]);

  if (authLoading || loading) return <p className="p-8 text-center">Loading profile...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;
  if (!profile) return <p className="p-8 text-center">Profile not found.</p>;

  return (
    <ProfileClient
      profile={profile}
      isOwnProfile={user?.id === profileId}
      currentUserId={user?.id ?? null}
      currentUserEmail={user?.email ?? null}
      lessonCount={0}
      recentLessons={[]}
    />
  );
}
