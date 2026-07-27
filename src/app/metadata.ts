
import { Metadata } from 'next';

const metadata: Metadata = {
  title: {
    default: 'eSchool - Learn English Online in Sudan',
    template: '%s | eSchool',
  },
  description: 'eSchool offers online English courses for students in Sudan. Learn spoken English, prepare for IELTS, and improve your English skills with our expert instructors.',
  keywords: ['Learn English Online', 'English Courses in Sudan', 'Spoken English', 'English for Beginners', 'IELTS Preparation', 'eSchool'],
  openGraph: {
    title: 'eSchool - Learn English Online in Sudan',
    description: 'eSchool offers online English courses for students in Sudan. Learn spoken English, prepare for IELTS, and improve your English skills with our expert instructors.',
    url: 'https://eschool.com',
    siteName: 'eSchool',
    images: [
      {
        url: 'https://eschool.com/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'eSchool - Learn English Online in Sudan',
    description: 'eSchool offers online English courses for students in Sudan. Learn spoken English, prepare for IELTS, and improve your English skills with our expert instructors.',
    images: ['https://eschool.com/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  themeColor: '#ffffff',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: 'https://eschool.com',
    languages: {
      'en-US': 'https://eschool.com/en-US',
    },
  },
};

export default metadata;
