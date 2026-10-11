'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getProfile } from '@/utils/supabase/data';
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

    const refreshProfile = () => {
      void getProfile(profileId)
        .then((result) => {
          if (active) {
            setProfile(result);
            setError(null);
          }
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
    };

    setLoading(true);
    setError(null);
    refreshProfile();

    const client = createClient();
    const channel = client
      .channel(`profile-${profileId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${profileId}` },
        refreshProfile,
      )
      .subscribe((status, subscriptionError) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(
            'Could not subscribe to profile updates:',
            subscriptionError ?? new Error(`Profile subscription failed: ${status}`),
          );
        }
      });

    return () => {
      active = false;
      void client.removeChannel(channel);
    };
  }, [profileId, authLoading]);

  if (authLoading || loading) {
    return <h1 className="p-8 text-center text-lg font-semibold" role="status">Loading profile…</h1>;
  }
  if (error) {
    return (
      <section className="p-8 text-center" role="alert">
        <h1 className="text-lg font-semibold text-red-700 dark:text-red-300">Could not load profile</h1>
        <p className="mt-2 text-gray-700 dark:text-gray-300">{error}</p>
      </section>
    );
  }
  if (!profile) {
    return (
      <section className="p-8 text-center">
        <h1 className="text-lg font-semibold">Profile not found</h1>
      </section>
    );
  }

  return (
    <ProfileClient
      profile={profile}
      isOwnProfile={user?.id === profileId}
      currentUserId={user?.id ?? null}
      currentUserEmail={user?.email ?? null}
    />
  );
}
