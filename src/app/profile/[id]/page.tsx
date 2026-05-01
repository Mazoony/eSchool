
import { notFound } from 'next/navigation';
import { createClient as createServerClient } from '../../../utils/supabase/server';
import ProfileClient from './ProfileClient';

interface ProfilePageProps {
  params: {
    id: string;
  };
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
  const profileId = params.id;
  const supabase = await createServerClient();

  const sessionResponse = await supabase.auth.getSession();
  const sessionUser = sessionResponse.data?.session?.user ?? null;
  const currentUserId = sessionUser?.id ?? null;
  const currentUserEmail = sessionUser?.email ?? null;
  const isOwnProfile = currentUserId === profileId;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio, created_at, updated_at')
    .eq('id', profileId)
    .maybeSingle();

  if (profileError) {
    console.error('Error loading profile:', profileError.message);
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
    />
  );
}
