
import { supabase } from '../../integrations/supabase/client';
import { Profile } from './types';
import { fetchUserProfile } from './profileUtils';
import { NavigateFunction } from 'react-router-dom';

// Sign in method
export const signInWithEmail = async (
  email: string, 
  password: string,
  setUser: (user: any) => void,
  setProfile: (profile: Profile | null) => void,
  setAuthError: (error: Error | null) => void,
  navigate: NavigateFunction
) => {
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
  }
};

// Sign up method
export const signUpWithEmail = async (
  email: string, 
  password: string,
  metadata: Record<string, unknown> | undefined,
  setUser: (user: any) => void,
  setProfile: (profile: Profile | null) => void,
  setAuthError: (error: Error | null) => void,
  navigate: NavigateFunction
) => {
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
  }
};

// Sign out method
export const signOutUser = async (
  setUser: (user: null) => void,
  setProfile: (profile: null) => void,
  setAuthError: (error: Error | null) => void,
  navigate: NavigateFunction
) => {
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
  }
};

// Sign in with provider method
export const signInWithProvider = async (
  provider: string,
  setAuthError: (error: Error | null) => void
) => {
  try {
    if (provider === 'google') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) {
        setAuthError(error);
        console.error('Google sign-in error:', error);
      }
    } else if (provider === 'facebook') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
      });
      if (error) {
        setAuthError(error);
        console.error('Facebook sign-in error:', error);
      }
    }
  } catch (error) {
    console.error(`Unexpected ${provider} sign-in error:`, error);
    setAuthError(error as Error);
  }
};
