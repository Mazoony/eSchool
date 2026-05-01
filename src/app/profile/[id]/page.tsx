
import { notFound } from 'next/navigation';
import { createClient as createServerClient } from '../../../utils/supabase/server';
import ProfileClient from './ProfileClient';

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

interface ProfileData {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface LessonSummary {
  id: string;
  title: string;
  created_at: string | null;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id: profileId } = await params;
  if (!profileId || profileId === 'undefined' || profileId === 'null' || !/^[0-9a-fA-F-]{36}$/.test(profileId)) {
    notFound();
  }

  const supabase = await createServerClient();

  const sessionResponse = await supabase.auth.getSession();
  const sessionUser = sessionResponse.data?.session?.user ?? null;
  const currentUserId = sessionUser?.id ?? null;
  const currentUserEmail = sessionUser?.email ?? null;
  const isOwnProfile = currentUserId === profileId;

  const loadProfile = async () => {
    const columns = ['id', 'username', 'full_name', 'avatar_url', 'bio', 'created_at', 'updated_at'];

    while (columns.length > 0) {
      const result = await supabase
        .from('profiles')
        .select(columns.join(', '))
        .eq('id', profileId)
        .maybeSingle();

      const profile = result.data as unknown as ProfileData | null;
      const error = result.error;

      if (!error) {
        return profile;
      }

      const missingMatch = error.message.match(/column .*\.(.*?) does not exist/i);
      if (!missingMatch) {
        console.error('Error loading profile:', error.message);
        return null;
      }

      const missingColumn = missingMatch[1].replace(/['"]+/g, '').trim();
      if (!columns.includes(missingColumn)) {
        console.error('Error loading profile:', error.message);
        return null;
      }

      columns.splice(columns.indexOf(missingColumn), 1);
    }

    console.error('Error loading profile: could not build a valid column set');
    return null;
  };

  let profile = await loadProfile();
  let createdFallbackProfile = false;

  if (!profile && isOwnProfile && currentUserId) {
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ id: currentUserId });

    if (insertError) {
      console.error('Error creating fallback profile row:', insertError.message);
    } else {
      createdFallbackProfile = true;
    }

    profile = {
      id: currentUserId,
      username: null,
      full_name: null,
      avatar_url: null,
      bio: null,
      created_at: null,
      updated_at: null,
    };
  }

  if (!profile) {
    notFound();
  }

  const [{ data: recentLessons, error: lessonsError }, { count: lessonCount }] = await Promise.all([
    supabase
      .from('lessons')
      .select('id, title, created_at')
      .eq('user_id', profileId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profileId),
  ]);

  if (lessonsError) {
    console.error('Error loading lessons for profile:', lessonsError.message);
  }

  const recentLessonsData = Array.isArray(recentLessons) ? recentLessons : [];

  return (
    <ProfileClient
      profile={profile as ProfileData}
      isOwnProfile={isOwnProfile}
      currentUserId={currentUserId}
      currentUserEmail={currentUserEmail}
      lessonCount={lessonCount ?? 0}
      recentLessons={recentLessonsData as LessonSummary[]}
      createdFallbackProfile={createdFallbackProfile}
    />
  );
}
