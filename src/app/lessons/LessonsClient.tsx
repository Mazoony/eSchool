'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AcademicCapIcon, ArrowLeftIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { GradeId, grades, isGradeId } from './curriculum';
import { useAuth } from '../AuthContext';
import ExpandableText from '../components/ExpandableText';
import { updateProfile } from '@/utils/supabase/data';

export default function LessonsClient() {
  const [selectedGrade, setSelectedGrade] = useState<GradeId | null>(null);
  const [preferredGrade, setPreferredGrade] = useState<GradeId | ''>('');
  const [savedPreferredGrade, setSavedPreferredGrade] = useState<GradeId | ''>('');
  const [savingPreference, setSavingPreference] = useState(false);
  const [preferenceMessage, setPreferenceMessage] = useState<string | null>(null);
  const [preferenceError, setPreferenceError] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();
  const grade = grades.find((item) => item.id === selectedGrade);
  const visibleGrades = preferredGrade
    ? grades.filter((item) => item.id === preferredGrade)
    : grades;

  useEffect(() => {
    const preference = user?.profile?.preferred_grade ?? '';
    setPreferredGrade(preference);
    setSavedPreferredGrade(preference);
  }, [user?.id, user?.profile?.preferred_grade]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  const savePreference = async (nextPreference: GradeId | '') => {
    if (!user) return;
    setSavingPreference(true);
    setPreferenceError(null);
    setPreferenceMessage(null);
    try {
      await updateProfile(user.id, {
        preferred_grade: nextPreference || null,
      });
      setSavedPreferredGrade(nextPreference);
      setPreferenceMessage('Your learning preference has been saved.');
    } catch (saveError: unknown) {
      console.error('Could not save the preferred learning path:', saveError);
      setPreferredGrade(savedPreferredGrade);
      setPreferenceError(saveError instanceof Error ? saveError.message : 'Could not save your preference.');
    } finally {
      setSavingPreference(false);
    }
  };

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
            Choose your learning path
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Explore English Foundation or select a school level and class.
          </p>
        </div>

        {!grade ? (
          <>
          <section className="mx-auto mb-8 max-w-3xl rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700" aria-label="Learning preference">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label htmlFor="preferred-learning-path" className="mb-2 block font-semibold text-gray-900 dark:text-gray-100">
                  Your preferred learning path <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <select
                  id="preferred-learning-path"
                  value={preferredGrade}
                  onChange={(event) => {
                    const value = event.target.value;
                    const nextPreference = isGradeId(value) ? value : '';
                    if (nextPreference === preferredGrade || savingPreference) return;
                    setPreferredGrade(nextPreference);
                    void savePreference(nextPreference);
                  }}
                  disabled={savingPreference}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">No preference</option>
                  {grades.map((item) => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Choose a path to show only its lessons. Choose “No preference” to show every path.
                </p>
              </div>
            </div>
            {preferenceError && <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">{preferenceError}</p>}
            {savingPreference && <p className="mt-3 text-sm text-gray-600 dark:text-gray-300" role="status">Saving your preference…</p>}
            {preferenceMessage && <p className="mt-3 text-sm text-green-700 dark:text-green-300" role="status">{preferenceMessage}</p>}
          </section>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {visibleGrades.map((item) => {
              const originalIndex = grades.findIndex((gradeItem) => gradeItem.id === item.id);
              return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'english-foundation') {
                    router.push(`/lessons/${item.id}`);
                  } else {
                    setSelectedGrade(item.id);
                  }
                }}
                className={`group flex h-full flex-col overflow-hidden rounded-3xl bg-white text-left shadow-lg ring-1 transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 dark:bg-gray-800 dark:ring-gray-700 ${
                  preferredGrade === item.id
                    ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                    : 'ring-gray-200'
                }`}
                aria-label={item.id === 'english-foundation'
                  ? `${item.title}, browse lessons`
                  : `${item.title}, ${item.classCount} classes`}
              >
                <div className={`flex h-48 shrink-0 flex-col justify-between bg-gradient-to-br ${item.accent} p-7 text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                    {item.id === 'english-foundation' ? (
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        Start here
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        Grade group 0{originalIndex}
                      </span>
                    )}
                    {preferredGrade === item.id && (
                      <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        Recommended
                      </span>
                    )}
                    </div>
                    <AcademicCapIcon className="h-9 w-9" aria-hidden="true" />
                  </div>
                  <h2 className="text-2xl font-extrabold">{item.title}</h2>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <ExpandableText
                    text={item.description}
                    className="min-h-[4.5rem] text-gray-600 dark:text-gray-300"
                  />
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-5 dark:border-gray-700">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {item.classCount > 0 ? `${item.classCount} classes` : 'Explore lessons'}
                    </span>
                    <span className="font-bold text-blue-600 transition group-hover:translate-x-1 dark:text-blue-400">
                      Explore <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </button>
              );
            })}
          </div>
          </>
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
