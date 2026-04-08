
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <header className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">eSchool</div>
        <nav className="space-x-4">
          <Link href="/login" className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Log In</Link>
          <Link href="/signup" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">Sign Up</Link>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Welcome to the Future of Learning
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg lg:text-xl text-gray-600 dark:text-gray-400">
              eSchool is a modern social platform connecting students and educators. Share ideas, collaborate on projects, and build your community.
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <Link href="/signup" className="inline-block px-8 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg transform hover:scale-105 transition-all duration-300">
                    Get Started for Free
                </Link>
                <Link href="/login" className="inline-block px-8 py-3 rounded-lg text-blue-600 dark:text-blue-400 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-lg transform hover:scale-105 transition-all duration-300">
                    Log In to Your Account
                </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Why eSchool?</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Everything you need to succeed in one place.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Social Feed</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Stay updated with a live feed of posts and announcements from your peers and instructors.</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Custom Profiles</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Create a personal profile, upload your avatar, and showcase your achievements.</p>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Interactive Community</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Engage with posts, share your thoughts, and connect with a vibrant learning community.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-6 py-4 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} eSchool. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
