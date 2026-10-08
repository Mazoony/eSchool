import { Metadata } from 'next';
import ProfilePageClient from './ProfilePageClient';

export const metadata: Metadata = {
  title: 'eSchool Profile',
  description: 'View and update your eSchool profile.',
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProfilePageClient profileId={id} />;
}
