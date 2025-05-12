
import { createContext, useContext, useState, useEffect, useCallback, FC, ReactNode } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types/user';
import { AuthContextType, Profile } from './types';
import { fetchUserProfile } from './profileUtils';
import { signInWithEmail, signUpWithEmail, signOutUser, signInWithProvider as signInWithProviderMethod } from './authMethods';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
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
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const navigate = useNavigate();

  // Refresh profile function with improved error handling
  const refreshProfile = async (): Promise<Profile | null> => {
    console.log("Refreshing profile for user:", user?.id);
    if (!user) {
      console.error("Cannot refresh profile: No user logged in");
      return null;
    }
    
    try {
      const updatedProfile = await fetchUserProfile(user.id);
      console.log("Refresh profile result:", updatedProfile);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        return updatedProfile;
      } else {
        console.warn("Failed to fetch updated profile - returned null");
        return null;
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
      toast.error("Failed to refresh profile data");
      return null;
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    const result = await signInWithEmail(email, password, setUser, setProfile, setAuthError, navigate);
    setLoading(false);
    return result;
  };

  // Sign up function
  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    setLoading(true);
    setAuthError(null);
    const result = await signUpWithEmail(email, password, metadata, setUser, setProfile, setAuthError, navigate);
    setLoading(false);
    return result;
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    setAuthError(null);
    await signOutUser(setUser, setProfile, setAuthError, navigate);
    setLoading(false);
  };

  // Sign in with provider function
  const signInWithProvider = async (provider: string) => {
    setLoading(true);
    setAuthError(null);
    await signInWithProviderMethod(provider, setAuthError);
    setLoading(false);
  };

  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Initial session found for user:", session.user.id);
          setUser(session.user);
          try {
            const userProfile = await fetchUserProfile(session.user.id);
            console.log("Initial profile loaded:", userProfile);
            setProfile(userProfile);
          } catch (profileError) {
            console.error("Error fetching initial profile:", profileError);
          }
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          console.log("Auth state changed for user:", session.user.id);
          setUser(session.user);
          try {
            const userProfile = await fetchUserProfile(session.user.id);
            console.log("Profile loaded after auth change:", userProfile);
            setProfile(userProfile);
          } catch (profileError) {
            console.error("Error fetching profile after auth change:", profileError);
          }
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
      profile,
      signIn,
      signUp,
      signOut,
      loading,
      authError,
      refreshProfile,
      isLoading: loading,
      session: user,
      signInWithProvider,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
