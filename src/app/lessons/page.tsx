import LessonsClient from './LessonsClient';
import { createMetadata } from '../metadata';

export const metadata = createMetadata({
  title: 'eSchool - Browse School Lessons',
  description: 'Choose your school grade and class to explore lessons on eSchool.',
  path: '/lessons',
});

export default function LessonsPage() {
  return <LessonsClient />;
}
