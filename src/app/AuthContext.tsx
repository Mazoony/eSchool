
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { AuthError, User } from '@supabase/supabase-js';

// Define a more complete type for our context, including the new functions
const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signUp: (email, password, name) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => void;
}>({
  user: null,
  loading: true,
  error: null,
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Check for an active session on initial load
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for changes in auth state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      // Cleanup the listener on unmount
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, name) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Store the user's name in the metadata
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      setError(error);
      setLoading(false);
      throw error;
    }
    setLoading(false);
  };

  // Sign in with Google (OAuth)
  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect back to the home page after successful login
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  // Sign out the user
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // The value provided to the context consumers
  const value = {
    user,
    loading,
    error,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
