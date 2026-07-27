
import { AuthProvider } from './AuthContext';
import Header from '../components/Header';
import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import Breadcrumbs from '../components/Breadcrumbs';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
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
  alternates: {
    canonical: '/',
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'eSchool',
    url: 'https://eschool.com',
    logo: 'https://eschool.com/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+249-123-456-789',
      contactType: 'customer service',
    },
    sameAs: [
      'https://www.facebook.com/eschool',
      'https://www.twitter.com/eschool',
      'https://www.linkedin.com/company/eschool',
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://eschool.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-900`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
                <Breadcrumbs />
                {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
