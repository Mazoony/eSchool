import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white dark:bg-gray-800">
        <Link href="#" className="flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">eSchool</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
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
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter text-gray-900 dark:text-gray-50 sm:text-5xl xl:text-6xl/none">
                    Unlock Your English Potential
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Join our community and learn English through engaging video lessons, interactive quizzes, and a supportive social network.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/lessons"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-50"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-50"
                  >
                    Log In
                  </Link>
                </div>
              </div>
              <Image
                src="/teacher.jpg"
                alt="Hero"
                width="550"
                height="550"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter text-gray-900 dark:text-gray-50 sm:text-5xl">
                  A Better Way to Learn English
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our platform offers a comprehensive set of tools and resources to help you succeed on your language-learning journey.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <Image src="/book.svg" alt="Lessons" width="32" height="32" />
                  <h3 className="text-xl font-bold">Engaging Lessons</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Learn from a library of video lessons covering grammar, vocabulary, and real-world conversations.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <Image src="/file.svg" alt="Quizzes" width="32" height="32" />
                  <h3 className="text-xl font-bold">Interactive Quizzes</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Test your knowledge with interactive quizzes and track your progress.
                </p>
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <Image src="/users.svg" alt="Community" width="32" height="32" />
                  <h3 className="text-xl font-bold">Supportive Community</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  Connect with other learners, practice your skills, and get feedback from native speakers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 eSchool. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
                Terms of Service
            </Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
                Privacy
            </Link>
        </nav>
      </footer>
    </div>
  );
}
