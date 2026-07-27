
import SocialFeed from '../components/SocialFeed';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social Feed',
  description: 'Connect with other English learners and instructors on the eSchool social feed.',
  keywords: ['eSchool community', 'English learning community', 'Sudan English students'],
  alternates: {
    canonical: 'https://eschool.com/social',
  },
};

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
