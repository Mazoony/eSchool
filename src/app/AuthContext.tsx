'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ensureProfile } from '@/utils/firebase/data';
import { getFirebaseServices } from '@/utils/firebase/client';
import { Profile, User } from './types';

interface Credentials {
  email: string;
  password: string;
}

interface AuthContextType {
  session: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  toastMessage: string | null;
  signOut: () => Promise<void>;
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (credentials: Credentials & { fullName?: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const appUser = (authUser: FirebaseUser, profile?: Profile): User => ({
  id: authUser.uid,
  email: authUser.email,
  displayName: authUser.displayName,
  photoURL: authUser.photoURL,
  profile,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    try {
      const { auth } = getFirebaseServices();
      unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          if (!mounted) return;
          setSession(firebaseUser);
          setLoading(true);
          setError(null);

          if (!firebaseUser) {
            setUser(null);
            setLoading(false);
            return;
          }

          try {
            const profile = await ensureProfile(firebaseUser);
            if (mounted) setUser(appUser(firebaseUser, profile));
          } catch (authError: unknown) {
            console.error('Failed to load Firebase profile:', authError);
            if (mounted) {
              setUser(appUser(firebaseUser));
              setError(authError instanceof Error ? authError.message : 'Could not load your profile.');
            }
          } finally {
            if (mounted) setLoading(false);
          }
        },
        (authError) => {
          console.error('Firebase authentication state error:', authError);
          if (mounted) {
            setError(authError.message);
            setLoading(false);
          }
        },
      );
    } catch (authError: unknown) {
      console.error('Failed to initialize Firebase authentication:', authError);
      if (mounted) {
        setError(authError instanceof Error ? authError.message : 'Could not initialize Firebase.');
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

  const signOut = useCallback(async () => {
    const { auth } = getFirebaseServices();
    await firebaseSignOut(auth);
    showToast('Signed out successfully');
    router.push('/');
  }, [router, showToast]);

  const signIn = useCallback(async ({ email, password }: Credentials) => {
    const { auth } = getFirebaseServices();
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async ({ email, password, fullName }: Credentials & { fullName?: string }) => {
    const { auth } = getFirebaseServices();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName?.trim()) {
      await updateProfile(credential.user, { displayName: fullName.trim() });
    }
    await ensureProfile(credential.user, fullName?.trim());
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { auth } = getFirebaseServices();
    await signInWithPopup(auth, new GoogleAuthProvider());
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, user, loading, error, toastMessage, signOut, signIn, signUp, signInWithGoogle }}
    >
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
