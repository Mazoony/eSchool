
import Link from 'next/link';
import { GlobeAltIcon, UserGroupIcon, UserCircleIcon, AcademicCapIcon, ChatBubbleLeftRightIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'eSchool - Learn English Online in Sudan',
  description: 'eSchool offers online English courses for students in Sudan. Learn spoken English, prepare for IELTS, and improve your English skills with our expert instructors.',
  alternates: {
    canonical: 'https://eschool.com',
  },
};

export default function LandingPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative text-center py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/hero-background.jpeg"
              alt="eSchool hero background"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div className="relative container mx-auto px-6">
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Unlock Your Potential with eSchool
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg lg:text-xl text-gray-600 dark:text-gray-400">
              The premier online platform for English language education in Sudan. Connect, learn, and grow with our vibrant community.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/register" className="inline-block px-8 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg transform hover:scale-105 transition-all duration-300">
                Start Your Journey
              </Link>
              <Link href="/social" className="inline-block px-8 py-3 rounded-lg text-blue-600 dark:text-blue-400 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-lg transform hover:scale-105 transition-all duration-300">
                Explore the Community
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Why eSchool is Different</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">A learning experience designed for Sudanese students.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md flex flex-col items-center">
                <AcademicCapIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Expert Instructors</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Learn from the best. Our certified instructors are dedicated to your success.</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md flex flex-col items-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Interactive Community</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Practice your English with fellow students and native speakers in a supportive environment.</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md flex flex-col items-center">
                <BookmarkIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Rich Resources</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Access a vast library of lessons, quizzes, and practice materials for all skill levels.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">From Our Community</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-600 dark:text-gray-300 italic">"eSchool has been a game-changer for my IELTS preparation. The instructors are amazing and the community is so supportive."</p>
                <div className="mt-4 flex items-center">
                  <Image src="/avatar1.jpeg" alt="User Avatar" width={40} height={40} className="rounded-full" />
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900 dark:text-white">Fatima A.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">IELTS Student</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-600 dark:text-gray-300 italic">"I love the social feed! It's a great way to practice my English every day and make new friends who are also learning."</p>
                <div className="mt-4 flex items-center">
                  <Image src="/avatar2.jpeg" alt="User Avatar" width={40} height={40} className="rounded-full" />
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900 dark:text-white">Mohammed H.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">University Student</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-600 dark:text-gray-300 italic">"As an instructor, eSchool provides the tools I need to effectively teach and engage with my students in a modern way."</p>
                <div className="mt-4 flex items-center">
                  <Image src="/avatar3.jpeg" alt="User Avatar" width={40} height={40} className="rounded-full" />
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900 dark:text-white">Ahmed I.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">English Instructor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">About eSchool</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Our mission is to make high-quality English education accessible to everyone in Sudan.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Links</h3>
              <ul className="mt-2 space-y-2">
                <li><Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Follow Us</h3>
              <div className="mt-2 flex space-x-4">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600"><span className="sr-only">Facebook</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg></a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600"><span className="sr-only">Twitter</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-.424.727-.666 1.581-.666 2.477 0 1.61.82 3.027 2.07 3.868-.76-.025-1.475-.232-2.1-.586v.054c0 2.256 1.605 4.14 3.737 4.568-.39.106-.803.163-1.227.163-.3 0-.593-.028-.877-.082.593 1.85 2.307 3.198 4.342 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.092 7.14 2.092 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.403-.014-.602.91-.658 1.7-1.475 2.323-2.41z" /></svg></a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600"><span className="sr-only">Instagram</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.058 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.059 1.689.073 4.948.073s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z" /></svg></a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} eSchool. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
