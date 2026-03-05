'use client';

import { AuthProvider, useAuth } from './AuthContext';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import MobileNav from './components/MobileNav';
import Header from './components/Header';
import { Inter } from 'next/font/google';
import './globals.css';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

function AppLayout({ children }: { children: React.ReactNode }) {
  const { loading, session } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading authentication...</div>;
  }

  const publicPaths = ['/', '/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 ${inter.className}`}>
      <Header />
      {session && !isPublicPath ? (
        <div className="flex">
          <LeftSidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </main>
          <RightSidebar />
          <MobileNav />
        </div>
      ) : (
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      )}
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
