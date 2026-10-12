'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { GradeId, grades, isGradeId } from '../lessons/curriculum';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | ''>('');
  const [preferredGrade, setPreferredGrade] = useState<GradeId | ''>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!gender) {
      setError('Select female or male.');
      return;
    }

    try {
      await signUp({
        email,
        password,
        fullName,
        phoneNumber,
        birthDate,
        gender,
        preferredGrade: preferredGrade || null,
      });
      router.push('/lessons');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 flex flex-col items-center justify-center dark:bg-gray-900">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-50">Create an Account</h1>
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-gray-700 font-bold mb-2 dark:text-gray-200">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
              required
              autoComplete="name"
              aria-describedby={error ? 'error-message' : undefined}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block text-gray-700 font-bold mb-2 dark:text-gray-200">
              Phone number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={25}
              title="Use 7 to 15 digits. You may include a country code, spaces, parentheses, dots, or hyphens."
              autoComplete="tel"
              className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
              required
              aria-describedby={error ? 'error-message phone-help' : 'phone-help'}
            />
            <p id="phone-help" className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Include your country code if needed (for example, +249).
            </p>
          </div>
          <div className="mb-4">
            <label htmlFor="gender" className="block text-gray-700 font-bold mb-2 dark:text-gray-200">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => {
                const value = e.target.value;
                setGender(value === 'female' || value === 'male' ? value : '');
              }}
              className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
              required
              aria-describedby={error ? 'error-message privacy-note' : 'privacy-note'}
            >
              <option value="" disabled>Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="birthDate" className="block text-gray-700 font-bold mb-2 dark:text-gray-200">
              Birthdate
            </label>
            <input
              type="date"
              id="birthDate"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              autoComplete="bday"
              className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
              required
              aria-describedby={error ? 'error-message privacy-note' : 'privacy-note'}
            />
            <p id="privacy-note" className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Your phone number, birthdate, and gender are private and are not shown on your public profile.
            </p>
          </div>
          <div className="mb-4">
            <label htmlFor="preferredGrade" className="block text-gray-700 font-bold mb-2 dark:text-gray-200">
              Preferred learning path <span className="font-normal">(optional)</span>
            </label>
            <select
              id="preferredGrade"
              value={preferredGrade}
              onChange={(event) => setPreferredGrade(isGradeId(event.target.value) ? event.target.value : '')}
              className="w-full rounded-lg border bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
              aria-describedby="preferred-grade-help"
            >
              <option value="">I’ll choose later</option>
              {grades.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>
            <p id="preferred-grade-help" className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              We’ll highlight this path on your lessons page. You can change it anytime.
            </p>
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
              required
              autoComplete="email"
              aria-describedby={error ? 'error-message' : undefined}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2 dark:text-gray-200">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                className="w-full px-3 py-2 pr-12 border rounded-lg bg-white text-gray-900 focus:outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-50"
                required
                aria-describedby={error ? 'password-help error-message' : 'password-help'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword
                  ? <EyeSlashIcon aria-hidden="true" className="h-5 w-5" />
                  : <EyeIcon aria-hidden="true" className="h-5 w-5" />}
              </button>
            </div>
            <p id="password-help" className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Use at least 8 characters. A longer, unique password that mixes words, numbers, and symbols is easier to keep secure. Avoid personal information or passwords you use elsewhere.
            </p>
          </div>
          {error && <p id="error-message" className="text-red-600 dark:text-red-400 text-sm mb-4" role="alert">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          >
            Sign Up
          </button>
        </form>
      </div>
    </main>
  );
}
