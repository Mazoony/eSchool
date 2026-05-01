import { notFound } from 'next/navigation';
import LessonDetails from './LessonDetails';

interface LessonPageProps {
  params: Promise<{
    id?: string;
  }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = await params;
  const lessonId = resolvedParams?.id;

  if (!lessonId) {
    return notFound();
  }

  return <LessonDetails lessonId={lessonId} />;
}
