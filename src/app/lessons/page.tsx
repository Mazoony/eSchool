import LessonsClient from './LessonsClient';
import { createMetadata } from '../metadata';

export const metadata = createMetadata({
  title: 'eSchool - English Lessons for Sudanese Students',
  description: 'Explore our comprehensive English lessons designed for Sudanese students. From beginner to advanced, find the right course to improve your language skills.',
  path: '/lessons',
});

export default function LessonsPage() {
  return <LessonsClient />;
}
