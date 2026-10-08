
import SocialPageClient from './SocialPageClient';
import { createMetadata } from '../metadata';

export const metadata = createMetadata({
  title: 'eSchool Social Feed - Connect with English Learners in Sudan',
  description: 'Connect with other English learners and instructors on the eSchool social feed. Share your progress, ask questions, and practice your skills with our community in Sudan.',
  path: '/social',
});

export default function SocialPage() {
  return (
    <div className="container mx-auto p-4">
      <SocialPageClient />
    </div>
  );
}
