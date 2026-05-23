import { notFound } from 'next/navigation';
import { createClient } from '../../../utils/supabase/server';
import ProfileClient from './ProfileClient';

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const awaitedParams = await params;
  const supabase = await createClient();

  const [{ data: currentUserData }, { data: profileData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profiles').select('*').eq('id', awaitedParams.id).maybeSingle(),
  ]);

  const currentUser = currentUserData?.user ?? null;

  if (!profileData) {
    if (currentUser?.id === awaitedParams.id) {
      // Capture Google metadata if available
      const fullName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || null;
      const avatarUrl = currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || null;
      
      const { data: fallbackProfile, error: fallbackError } = await supabase
        .from('profiles')
        .insert({ 
          id: awaitedParams.id,
          full_name: fullName,
          avatar_url: avatarUrl
        })
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
      isOwnProfile={currentUser?.id === awaitedParams.id}
      currentUserId={currentUser?.id ?? null}
      currentUserEmail={currentUser?.email ?? null}
      lessonCount={0}
      recentLessons={[]}
    />
  );
}
