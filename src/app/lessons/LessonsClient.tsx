'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AcademicCapIcon, ArrowLeftIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { GradeId, grades } from './curriculum';
import { useAuth } from '../AuthContext';
import ExpandableText from '../components/ExpandableText';

export default function LessonsClient() {
  const [selectedGrade, setSelectedGrade] = useState<GradeId | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();
  const grade = grades.find((item) => item.id === selectedGrade);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="p-8 text-center text-gray-600 dark:text-gray-300">Checking your sign-in...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Your learning journey
          </p>
          <h1 className="text-4xl font-black tracking-tight text-gray-950 dark:text-white sm:text-5xl">
            Choose your grade
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Select a school level, then choose your class to explore its lessons.
          </p>
        </div>

        {!grade ? (
          <div className="grid gap-6 md:grid-cols-3">
            {grades.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedGrade(item.id)}
                className="group overflow-hidden rounded-3xl bg-white text-left shadow-lg ring-1 ring-gray-200 transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 dark:bg-gray-800 dark:ring-gray-700"
                aria-label={`${item.title}, ${item.classCount} classes`}
              >
                <div className={`bg-gradient-to-br ${item.accent} p-7 text-white`}>
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                      Grade group 0{index + 1}
                    </span>
                    <AcademicCapIcon className="h-9 w-9" aria-hidden="true" />
                  </div>
                  <h2 className="mt-10 text-2xl font-extrabold">{item.title}</h2>
                </div>
                <div className="p-7">
                  <ExpandableText
                    text={item.description}
                    className="text-gray-600 dark:text-gray-300"
                  />
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5 dark:border-gray-700">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {item.classCount} classes
                    </span>
                    <span className="font-bold text-blue-600 transition group-hover:translate-x-1 dark:text-blue-400">
                      Explore <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <section aria-labelledby="classes-heading">
            <button
              type="button"
              onClick={() => setSelectedGrade(null)}
              className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-300 dark:hover:bg-gray-800"
            >
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              All grades
            </button>
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                {grade.title}
              </p>
              <h2 id="classes-heading" className="mt-2 text-3xl font-extrabold text-gray-950 dark:text-white">
                Choose your class
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: grade.classCount }, (_, index) => {
                const classNumber = index + 1;
                return (
                  <Link
                    key={classNumber}
                    href={`/lessons/${grade.id}/class-${classNumber}`}
                    className="group flex items-center gap-4 rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 dark:bg-gray-800 dark:ring-gray-700"
                  >
                    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grade.accent} text-xl font-black text-white`}>
                      {classNumber}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-bold text-gray-900 dark:text-white">
                        Class {classNumber}
                      </span>
                      <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                        Browse class lessons
                      </span>
                    </span>
                    <BookOpenIcon className="h-6 w-6 text-gray-400 transition group-hover:text-blue-600 dark:group-hover:text-blue-400" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
