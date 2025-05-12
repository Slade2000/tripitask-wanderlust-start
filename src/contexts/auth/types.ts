
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../../types/user';

// Profile interface with all the fields
export interface Profile {
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
  // Computed properties
  first_name: string | null;
  last_name: string | null;
}

// Auth context interface
export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: Error | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ success: boolean; error: Error | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  authError: Error | null;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
  session: User | null;
  signInWithProvider: (provider: string) => Promise<void>;
}
