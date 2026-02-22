import SocialFeed from "../components/SocialFeed";
import Link from "next/link";

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white dark:bg-gray-800 shadow-md">
        <Link href="/" className="flex items-center justify-center">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">eSchool</span>
        </Link>
        <nav className="ml-auto flex gap-6 sm:gap-8">
          <Link href="/lessons" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
            Lessons
          </Link>
          <Link href="/social" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
            Social
          </Link>
          <Link href="/profile" className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
            Profile
          </Link>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-50 mb-12">Social Feed</h1>
        <SocialFeed />
      </main>
    </div>
  );
}
