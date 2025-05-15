
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../../types/user';
import { Json } from '@/integrations/supabase/types';

// Define certificate interface
export interface Certificate {
  name: string;
  verified: boolean;
  file_url?: string;
}

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
  certifications?: Certificate[] | null;
  trade_registry_number?: string | null;
  total_earnings?: number | null;
  available_balance?: number | null;
  pending_earnings?: number | null;
  total_withdrawn?: number | null;
  // Computed properties
  first_name: string | null;
  last_name: string | null;
  // Add the updateProfile method to the interface
  updateProfile?: (profileData: Partial<Profile>) => Promise<Profile | null>;
}

// Utils for converting between Certificate and Json types
export const certificationsFromJson = (json: Json | null): Certificate[] | null => {
  if (!json) return null;
  try {
    // Ensure json is an array before mapping
    if (Array.isArray(json)) {
      return json.map(cert => {
        // Ensure cert is an object with name and verified properties
        if (cert && typeof cert === 'object' && cert !== null) {
          const certObj = cert as Record<string, any>;
          return {
            name: certObj.name as string || '',
            verified: Boolean(certObj.verified) || false,
            file_url: certObj.file_url as string || undefined
          };
        }
        return { name: '', verified: false };
      });
    }
    return [];
  } catch (e) {
    console.error("Error parsing certifications from JSON:", e);
    return [];
  }
};

export const certificationsToJson = (certs: Certificate[] | null): Json => {
  if (!certs) return [];
  // Convert Certificate array to a format compatible with Json
  // We need to explicitly create a new array to ensure proper typing
  return certs as unknown as Json;
};

// Auth context interface
export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: Error | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ success: boolean; error: Error | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
  authError: Error | null;
  refreshProfile: () => Promise<Profile | null>;
  isLoading: boolean;
  session: User | null;
  signInWithProvider: (provider: string) => Promise<void>;
}
