import { notFound } from 'next/navigation';
import { createClient } from '../../../utils/supabase/server';
import ProfileClient from './ProfileClient';

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = await createClient();

  const [{ data: currentUserData }, { data: profileData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profiles').select('*').eq('id', params.id).maybeSingle(),
  ]);

  const currentUser = currentUserData?.user ?? null;

  if (!profileData) {
    if (currentUser?.id === params.id) {
      const { data: fallbackProfile, error: fallbackError } = await supabase
        .from('profiles')
        .insert({ id: params.id })
        .select('*')
        .single();

      if (fallbackError || !fallbackProfile) {
        console.error('Failed to create fallback profile:', fallbackError?.message);
        return notFound();
      }

      return (
        <ProfileClient
          profile={fallbackProfile}
          isOwnProfile={true}
          currentUserId={currentUser.id}
          currentUserEmail={currentUser.email ?? null}
          lessonCount={0}
          recentLessons={[]}
          createdFallbackProfile={true}
        />
      );
    }

    return notFound();
  }

  return (
    <ProfileClient
      profile={profileData}
      isOwnProfile={currentUser?.id === params.id}
      currentUserId={currentUser?.id ?? null}
      currentUserEmail={currentUser?.email ?? null}
      lessonCount={0}
      recentLessons={[]}
    />
  );
}
