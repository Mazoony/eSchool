'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ensureProfile, getLessonReminderSettings } from '@/utils/supabase/data';
import { Profile, User } from './types';
import { GradeId, isGradeId } from './lessons/curriculum';

interface Credentials {
  email: string;
  password: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  toastMessage: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (credentials: Credentials & {
    fullName?: string;
    phoneNumber: string;
    birthDate: string;
    gender: 'female' | 'male';
    preferredGrade?: GradeId | null;
  }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAppUser(authUser: SupabaseUser, profile?: Profile | null): User {
  return {
    id: authUser.id,
    email: authUser.email ?? null,
    displayName: authUser.user_metadata.full_name ?? authUser.user_metadata.name ?? null,
    photoURL: authUser.user_metadata.avatar_url ?? authUser.user_metadata.picture ?? null,
    profile: profile ?? undefined,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;
    let client: ReturnType<typeof createClient>;

    const applySession = async (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      if (!nextSession?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const [profile, reminderSettings] = await Promise.all([
          ensureProfile(
            nextSession.user.id,
            nextSession.user.user_metadata as Record<string, unknown>,
          ),
          getLessonReminderSettings(nextSession.user.id),
        ]);
        if (mounted) setUser(toAppUser(nextSession.user, { ...profile, ...reminderSettings }));
      } catch (profileError: unknown) {
        console.error('Failed to load Supabase profile:', profileError);
        if (mounted) {
          setUser(toAppUser(nextSession.user));
          setError(profileError instanceof Error ? profileError.message : 'Could not load your profile.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    try {
      client = createClient();
      client.auth.getSession()
        .then(({ data, error: sessionError }) => {
          if (sessionError) throw sessionError;
          return applySession(data.session);
        })
        .catch((authError: unknown) => {
          console.error('Failed to load Supabase session:', authError);
          if (mounted) {
            setError(authError instanceof Error ? authError.message : 'Could not load your session.');
            setLoading(false);
          }
        });

      const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
        window.setTimeout(() => void applySession(nextSession), 0);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch (authError: unknown) {
      console.error('Failed to initialize Supabase authentication:', authError);
      if (mounted) {
        setError(authError instanceof Error ? authError.message : 'Could not initialize authentication.');
        setLoading(false);
      }
    }

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const refreshProfile = useCallback(async () => {
    const authUser = session?.user;
    if (!authUser) return;
    const [profile, reminderSettings] = await Promise.all([
      ensureProfile(authUser.id, authUser.user_metadata as Record<string, unknown>),
      getLessonReminderSettings(authUser.id),
    ]);
    setUser((currentUser) =>
      currentUser?.id === authUser.id
        ? toAppUser(authUser, { ...profile, ...reminderSettings })
        : currentUser,
    );
  }, [session]);

  const signOut = useCallback(async () => {
    const { error: signOutError } = await createClient().auth.signOut();
    if (signOutError) throw signOutError;
    showToast('Signed out successfully');
    router.push('/');
  }, [router, showToast]);

  const signIn = useCallback(async ({ email, password }: Credentials) => {
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
  }, []);

  const signUp = useCallback(async ({
    email,
    password,
    fullName,
    phoneNumber,
    birthDate,
    gender,
    preferredGrade,
  }: Credentials & {
    fullName?: string;
    phoneNumber: string;
    birthDate: string;
    gender: 'female' | 'male';
    preferredGrade?: GradeId | null;
  }) => {
    if (password.length < 8) {
      throw new Error('Choose a password with at least 8 characters.');
    }

    const normalizedPhoneNumber = phoneNumber.trim();
    const digits = normalizedPhoneNumber.replace(/\D/g, '');
    if (!/^\+?[0-9 ().-]{7,25}$/.test(normalizedPhoneNumber) || digits.length < 7 || digits.length > 15) {
      throw new Error('Enter a valid phone number with 7 to 15 digits.');
    }
    const parsedBirthDate = new Date(`${birthDate}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)
      || Number.isNaN(parsedBirthDate.getTime())
      || parsedBirthDate.toISOString().slice(0, 10) !== birthDate
    ) {
      throw new Error('Enter a valid birthdate.');
    }
    if (birthDate > new Date().toISOString().slice(0, 10)) {
      throw new Error('Birthdate cannot be in the future.');
    }
    if (gender !== 'female' && gender !== 'male') {
      throw new Error('Select female or male.');
    }
    if (preferredGrade && !isGradeId(preferredGrade)) {
      throw new Error('Select a valid learning path.');
    }

    const { error: signUpError } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName?.trim() || null,
          phone_number: normalizedPhoneNumber,
          birth_date: birthDate,
          gender,
          preferred_grade: preferredGrade || null,
        },
      },
    });
    if (signUpError) throw signUpError;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error: oauthError } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) throw oauthError;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        error,
        toastMessage,
        refreshProfile,
        signOut,
        signIn,
        signUp,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
