'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { createClient } from '../utils/supabase/client'; // Correctly import the client-side client
import { Session, User as SupabaseUser, SignInWithPasswordCredentials } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Define a type for the user profile
interface Profile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Extend the Supabase User type to include the profile
export interface User extends SupabaseUser {
  profile?: Profile;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  toastMessage: string | null;
  signOut: () => Promise<void>;
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<void>;
  signUp: (credentials: SignInWithPasswordCredentials) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch (e: any) {
      console.error("Failed to create Supabase client:", e.message);
      setError("Failed to initialize authentication. Please check your Supabase configuration.");
      setLoading(false);
      return null;
    }
  }, []);

  const createFallbackProfile = async (userId: string, userMetadata?: any) => {
    if (!supabase) return null;
    
    // Extract name and picture from user metadata (for Google OAuth)
    const fullName = userMetadata?.full_name || userMetadata?.name || null;
    const avatarUrl = userMetadata?.avatar_url || userMetadata?.picture || null;
    
    const { error } = await supabase.from('profiles').insert({ 
      id: userId,
      full_name: fullName,
      avatar_url: avatarUrl
    });
    if (error) {
      console.error('Error creating fallback profile row:', error.message);
      return null;
    }

    return {
      id: userId,
      username: null,
      full_name: fullName,
      avatar_url: avatarUrl,
      bio: null,
      created_at: null,
      updated_at: null,
    } as Profile;
  };

  const fetchProfileData = async (userId: string, createIfMissing = false, userMetadata?: any) => {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return createIfMissing ? await createFallbackProfile(userId, userMetadata) : null;
    }

    if (data) {
      return data as Profile;
    }

    return createIfMissing ? await createFallbackProfile(userId, userMetadata) : null;
  };

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;
    let authSubscription: any;
    const loadingTimeout = setTimeout(() => {
        if (loading) {
            console.warn("Authentication timeout");
            setError("Authentication timed out. Please check your network connection and Supabase configuration.");
            setLoading(false);
        }
    }, 10000); // 10 second timeout

    const fetchSessionAndProfile = async () => {
      try {
        // Small delay to allow session cookie to be set after OAuth callback
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const response = await supabase.auth.getSession();
        const session = response.data?.session ?? null;
        if (!mounted) return;

        setSession(session);

        if (session?.user) {
          const profile = await fetchProfileData(session.user.id, true, session.user.user_metadata);

          if (!mounted) return;
          setUser({ ...session.user, profile: profile || undefined });
        } else {
          setUser(null);
        }
      } catch (error: any) {
        console.error('Error in fetchSessionAndProfile:', error.message);
        if (mounted) {
            setUser(null);
            setError("Failed to fetch user session. Please try again.");
        }
      } finally {
        if (mounted) {
            setLoading(false);
            clearTimeout(loadingTimeout);
        }
      }
    };

    fetchSessionAndProfile();

    try {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        setSession(session ?? null);

        if (session?.user) {
          const profile = await fetchProfileData(session.user.id, true, session.user.user_metadata);
          setUser({ ...session.user, profile: profile || undefined });

          if (_event === 'SIGNED_IN') {
            router.push(`/profile/${session.user.id}`);
          }
        } else {
          setUser(null);
        }

        setLoading(false);
        clearTimeout(loadingTimeout);
      });

      authSubscription = data?.subscription;
    } catch (error: any) {
      console.warn('Failed to subscribe to auth state changes:', error.message);
    }

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      if (authSubscription?.unsubscribe) {
        authSubscription.unsubscribe();
      }
    };
  }, [router, supabase]);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    showToast('Signed out successfully');
    router.push('/');
  };

  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    if (!supabase) throw new Error("Authentication service not available.");
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) {
      throw error;
    }
  };

  const signUp = async (credentials: SignInWithPasswordCredentials) => {
    if (!supabase) throw new Error("Authentication service not available.");
    const { error } = await supabase.auth.signUp(credentials);
    if (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase) throw new Error("Authentication service not available.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, error, toastMessage, signOut, signIn, signUp, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
