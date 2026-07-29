
import SocialFeed from '../components/SocialFeed';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { createMetadata } from '../metadata';

export const metadata = createMetadata({
  title: 'eSchool Social Feed - Connect with English Learners in Sudan',
  description: 'Connect with other English learners and instructors on the eSchool social feed. Share your progress, ask questions, and practice your skills with our community in Sudan.',
  path: '/social',
});

export default async function SocialPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/');
  }

  return (
    <div className="container mx-auto p-4">
      <SocialFeed />
    </div>
  );
}
