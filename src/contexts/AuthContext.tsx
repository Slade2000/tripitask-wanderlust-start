import { createContext, useContext, useState, useEffect, useCallback, FC, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/user';

// Update Profile interface to include the new fields
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  business_name?: string | null;
  about?: string | null;
  location?: string | null;
  services?: string[] | null;
  rating?: number | null;
  jobs_completed?: number | null;
  updated_at?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: Error | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ success: boolean; error: Error | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  authError: Error | null;
  refreshProfile: () => Promise<void>; // Add this method
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  signIn: async () => ({ success: false, error: new Error('Not implemented') }),
  signUp: async () => ({ success: false, error: new Error('Not implemented') }),
  signOut: async () => Promise.resolve(),
  loading: false,
  authError: null,
  refreshProfile: async () => Promise.resolve(),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async (userId: string) => {
    console.log(`Fetching profile for user: ${userId}`);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      console.log('Profile data received:', data);
      return data;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      return null;
    }
  }, []);
  
  // Add refresh profile function
  const refreshProfile = async () => {
    if (user) {
      const updatedProfile = await fetchUserProfile(user.id);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign-in error:', error);
        setAuthError(error);
        return { success: false, error };
      }

      if (data.user) {
        setUser(data.user);
        const userProfile = await fetchUserProfile(data.user.id);
        setProfile(userProfile);
        navigate('/home');
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected sign-in error:', error);
      setAuthError(error as Error);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        console.error('Sign-up error:', error);
        setAuthError(error);
        return { success: false, error };
      }

      if (data.user) {
        setUser(data.user);
        // Create a profile in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, full_name: metadata?.full_name as string }]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          setAuthError(profileError);
          return { success: false, error: profileError };
        }
        
        const userProfile = await fetchUserProfile(data.user.id);
        setProfile(userProfile);
        navigate('/welcome-after-login');
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected sign-up error:', error);
      setAuthError(error as Error);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign-out error:', error);
        setAuthError(error);
      }

      setUser(null);
      setProfile(null);
      navigate('/');
    } catch (error) {
      console.error('Unexpected sign-out error:', error);
      setAuthError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        } else {
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
          setUser(session.user);
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      signIn,
      signUp,
      signOut,
      loading,
      authError,
      refreshProfile, // Add the refresh function to the context
    }}>
      {children}
    </AuthContext.Provider>
  );
};

