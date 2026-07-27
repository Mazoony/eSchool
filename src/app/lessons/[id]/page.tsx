
import { notFound } from 'next/navigation';
import LessonDetails from './LessonDetails';
import { getLesson } from '../actions';
import { Metadata, ResolvingMetadata } from 'next';

interface LessonPageProps {
  params: {
    id: string;
  };
}

// DYNAMIC METADATA
export async function generateMetadata(
  { params }: LessonPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const lesson = await getLesson(params.id);

  const previousImages = (await parent).openGraph?.images || [];

  if (lesson) {
    return {
      title: `${lesson.title} - eSchool`,
      description: lesson.description,
      openGraph: {
        title: lesson.title,
        images: [...previousImages],
      },
      alternates: {
        canonical: `https://eschool.com/lessons/${params.id}`,
      },
    };
  }

  return {
    title: 'Lesson Not Found - eSchool',
    description: 'This lesson could not be found.',
    alternates: {
        canonical: `https://eschool.com/lessons/${params.id}`,
      },
  };
}


export default async function LessonPage({ params }: LessonPageProps) {
  const lesson = await getLesson(params.id);

  if (!lesson) {
    return notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: lesson.title,
    description: lesson.description,
    provider: {
      '@type': 'Organization',
      name: 'eSchool',
      sameAs: 'https://eschool.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LessonDetails lesson={lesson} />
    </>
  );
}
