
import { notFound } from 'next/navigation';
import { createClient } from '../../../utils/supabase/server';
import ProfileClient from './ProfileClient';
import { Metadata, ResolvingMetadata } from 'next';

// DYNAMIC METADATA
export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', params.id)
    .single();

  const previousImages = (await parent).openGraph?.images || [];

  if (profile) {
    return {
      title: `${profile.full_name}'s Profile - eSchool`,
      description: `View the profile of ${profile.full_name}, an eSchool user. Connect with them and see their progress.`,
      openGraph: {
        title: `${profile.full_name}'s Profile`,
        images: [...previousImages],
      },
      alternates: {
        canonical: `https://eschool.com/profile/${params.id}`,
      },
    };
  }

  return {
    title: 'Profile Not Found - eSchool',
    description: 'This profile could not be found.',
    alternates: {
        canonical: `https://eschool.com/profile/${params.id}`,
      },
  };
}


export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const [{ data: currentUserData }, { data: profileData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profiles').select('*').eq('id', params.id).maybeSingle(),
  ]);

  const currentUser = currentUserData?.user ?? null;

  if (!profileData) {
    if (currentUser?.id === params.id) {
      // Capture Google metadata if available
      const fullName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || null;
      const avatarUrl = currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || null;
      
      const { data: fallbackProfile, error: fallbackError } = await supabase
        .from('profiles')
        .insert({ 
          id: params.id,
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
      isOwnProfile={currentUser?.id === params.id}
      currentUserId={currentUser?.id ?? null}
      currentUserEmail={currentUser?.email ?? null}
      lessonCount={0}
      recentLessons={[]}
    />
  );
}
