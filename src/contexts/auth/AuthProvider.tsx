import { createContext, useContext, useState, useEffect, useCallback, FC, ReactNode } from 'react';
import { supabase, getCurrentSession } from '../../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types/user';
import { AuthContextType, Profile } from './types';
import { toast } from 'sonner';
import { signInWithEmail, signUpWithEmail, signOutUser, signInWithProvider as signInWithProviderMethod } from './authMethods';
import { clearProfileCache } from './profileUtils';

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null, // This will be set from ProfileProvider
  signIn: async () => ({ success: false, error: new Error('Not implemented') }),
  signUp: async () => ({ success: false, error: new Error('Not implemented') }),
  signOut: async () => Promise.resolve(),
  loading: false,
  authError: null,
  refreshProfile: async () => Promise.resolve(null),
  isLoading: false,
  session: null,
  signInWithProvider: async () => Promise.resolve(),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const navigate = useNavigate();
  
  // This function will actually use the ProfileProvider's refresh function
  // but we keep it here for backward compatibility
  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    console.log("Auth provider delegating refreshProfile call to ProfileProvider");
    return null; // Will be overridden by ProfileProvider
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithEmail(email, password, setUser, setProfile, setAuthError, navigate);
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await signUpWithEmail(email, password, metadata, setUser, setProfile, setAuthError, navigate);
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signOutUser(setUser, setProfile, setAuthError, navigate);
      // Clear profile cache on sign out
      clearProfileCache();
    } finally {
      setLoading(false);
    }
  };

  // Sign in with provider function
  const signInWithProvider = async (provider: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithProviderMethod(provider, setAuthError);
    } finally {
      setLoading(false);
    }
  };

  // Handle initial session on page load with improved error handling
  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        setLoading(true);
        
        const session = await getCurrentSession();
        
        if (session?.user) {
          console.log("Initial session found for user:", session.user.id);
          setUser(session.user);
          // We don't fetch the profile here - that's now handled by ProfileProvider
        } else {
          console.log("No initial session found, user is not logged in");
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error fetching initial session:', error);
        setAuthError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSession();
  }, []);

  // Subscribe to auth state changes with improved handling
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event);
        
        if (session?.user) {
          console.log("Auth state changed for user:", session.user.id);
          setUser(session.user);
          // Profile loading is now handled by ProfileProvider
        } else {
          console.log("Auth state changed: No user logged in");
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      profile, // Will be overridden by ProfileProvider
      signIn,
      signUp,
      signOut,
      loading,
      authError,
      refreshProfile, // Will be overridden by ProfileProvider
      isLoading: loading,
      session: user,
      signInWithProvider,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
