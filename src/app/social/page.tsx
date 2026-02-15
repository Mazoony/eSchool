import Link from "next/link";

export default function Social() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white dark:bg-gray-800">
        <Link href="#" className="flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">eSchool</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-400">
            Home
          </Link>
          <Link href="/lessons" className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-400">
            Lessons
          </Link>
          <Link href="/social" className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-400">
            Social
          </Link>
          <Link href="/profile" className="text-sm font-medium hover:underline underline-offset-4 dark:text-gray-400">
            Profile
          </Link>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">Social Feed</h1>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-800 p-6">
          <p className="text-gray-500 dark:text-gray-400">The social feed is coming soon! This is where you'll be able to connect with other learners, practice your skills, and get feedback from native speakers.</p>
        </div>
      </main>
    </div>
  );
}
