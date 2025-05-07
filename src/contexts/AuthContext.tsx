
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, Provider } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

interface UserMetadata {
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

interface SignInResult {
  error?: Error;
  data?: {
    user: User | null;
    session: Session | null;
  };
}

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<void>;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        
        // Only update state synchronously to avoid deadlocks
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // If we have a session, fetch profile data asynchronously
        if (newSession?.user) {
          setTimeout(() => {
            fetchProfile(newSession.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        fetchProfile(initialSession.user.id);
      }
      
      setIsLoading(false);
    }).catch((err) => {
      console.error('Error getting session:', err);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log("Profile data fetched:", data);
      
      // If full_name is not set, but first_name and last_name are available,
      // combine them to create full_name
      const profileData = data as Profile;
      if (!profileData.full_name && profileData.first_name) {
        profileData.full_name = `${profileData.first_name} ${profileData.last_name || ''}`.trim();
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, metadata?: UserMetadata) => {
    try {
      setIsLoading(true);
      
      // Prepare user metadata
      const userMetadata: UserMetadata = { ...metadata };
      
      // If we have both first and last name, create a full_name
      if (metadata?.first_name) {
        userMetadata.full_name = `${metadata.first_name} ${metadata.last_name || ''}`.trim();
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Ensure profile is created with name information
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              full_name: userMetadata.full_name,
              first_name: metadata?.first_name,
              last_name: metadata?.last_name,
              updated_at: new Date().toISOString(),
            });

          if (profileError) {
            console.error("Error updating profile:", profileError);
          }
        } catch (profileError) {
          console.error("Error in profile creation:", profileError);
        }
        
        toast.success("Account created successfully! Please verify your email.");
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign up');
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Don't navigate here - let the auth state change event handle it
        toast.success("Welcome back!");
        return { data };
      }
      
      return { data };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/home',
        }
      });

      if (error) {
        throw error;
      }

      // No need to navigate, as the OAuth flow will redirect the user
    } catch (error: any) {
      toast.error(error.message || `Error signing in with ${provider}`);
      console.error(`Sign in with ${provider} error:`, error);
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear state after sign out
      setSession(null);
      setUser(null);
      setProfile(null);
      
      navigate('/');
      toast.success("Successfully signed out");
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signUp,
    signIn,
    signOut,
    signInWithProvider,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
