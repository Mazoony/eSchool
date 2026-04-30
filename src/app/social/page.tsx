import SocialFeed from '../components/SocialFeed';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

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
