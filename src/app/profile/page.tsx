
import { Metadata } from 'next';
import ProfileRedirect from './ProfileRedirect';

export const metadata: Metadata = {
  title: 'Your Profile',
  description: 'Manage your eSchool profile, view your courses, and connect with the community.',
  keywords: ['eSchool profile', 'my English courses', 'Sudan online learning'],
  alternates: {
    canonical: 'https://eschool.com/profile',
  },
};

export default function ProfilePage() {
  return <ProfileRedirect />;
}
