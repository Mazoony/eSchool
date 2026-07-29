
import { Metadata } from 'next';

const defaultMetadata: Metadata = {
  metadataBase: new URL('https://eschool.com'),
  title: 'eSchool - Learn English in Sudan',
  description: 'eSchool is an online platform for Sudanese students to learn English, connect with instructors, and access high-quality educational resources. Prepare for the IELTS exam, improve your conversation skills, and join a vibrant community of learners.',
  keywords: ['English learning Sudan', 'online English courses', 'IELTS preparation Sudan', 'Sudan education', 'e-learning Sudan'],
  authors: [{ name: 'eSchool Team' }],
  openGraph: {
    title: 'eSchool - Learn English in Sudan',
    description: 'Join the leading online platform for English education in Sudan.',
    images: [
      {
        url: '/og-image.png',
        width: 800,
        height: 600,
        alt: 'eSchool Online Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'eSchool - Learn English in Sudan',
    description: 'The future of English education in Sudan is here. Join eSchool and start your learning journey today.',
    images: ['/twitter-image.png'],
  },
};

export const createMetadata = (page: {
  title: string;
  description: string;
  path: string;
}): Metadata => {
  const { title, description, path } = page;
  const url = `https://eschool.com${path}`;

  return {
    ...defaultMetadata,
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      title,
      description,
      url,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title,
      description,
    },
  };
};
