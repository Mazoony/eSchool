'use client';

import { useState } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // New state for the user's full name
  const [error, setError] = useState<string | null>(null);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { signInWithGoogle } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Step 1: Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (!authData.user) {
        setError('Sign up successful, but no user data returned. Please try logging in.');
        return;
      }

      // Step 2: Create the user's profile in the `profiles` table
      const { error: profileError } = await supabase.from('profiles').insert([
        { id: authData.user.id, full_name: fullName },
      ]);

      if (profileError) {
        setError(profileError.message);
        // Optional: Here you might want to delete the created user if the profile creation fails
        // await supabase.auth.api.deleteUser(authData.user.id);
      } else {
        // Try to sign the user in immediately so the client has a session
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            // If sign in fails (e.g., email confirmation required), fallback to social feed or login page
            console.warn('Sign in after sign up failed:', signInError.message);
            router.push('/login');
            return;
          }

          const sessionUser = signInData?.user;
          if (sessionUser) {
            router.push(`/social`);
            return;
          }

          // Fallback
          router.push('/social');
        } catch (err) {
          console.error('Error signing in after registration:', err);
          router.push('/login');
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };
  const handleGoogleSignUp = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Google sign up failed.');
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isGoogleSubmitting}
          className="w-full py-2 px-4 mb-6 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-300 disabled:opacity-50"
        >
          {isGoogleSubmitting ? 'Continuing with Google...' : 'Continue with Google'}
        </button>
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-gray-700 font-bold mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
