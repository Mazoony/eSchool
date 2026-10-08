
import { notFound } from 'next/navigation';
import LessonDetails from './LessonDetails';
import { Metadata } from 'next';
import LessonPageClient from './LessonPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'eSchool Lesson',
  description: 'Watch English learning lessons on eSchool.',
};


export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonPageClient lessonId={id} />;
}
