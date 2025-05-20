
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database';

const SUPABASE_URL = "https://dftdrtfpvojruqkbzcuw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdGRydGZwdm9qcnVxa2J6Y3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNzcxMjMsImV4cCI6MjA1NjY1MzEyM30.C4iKGFhyx1GxzQqPg8wFkMdJjruEB5qYfW0eyqR9ck0";

// Improved Supabase client configuration with better error handling
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  global: {
    headers: {
      // Ensure API key is always included in requests with correct lowercase name
      'apikey': SUPABASE_PUBLISHABLE_KEY
    },
    fetch: (url: RequestInfo | URL, options?: RequestInit) => {
      // FIX: Pass headers untouched instead of spreading them
      return fetch(url, {
        ...options,
        // Do not modify headers - pass them through directly
        headers: options?.headers
      }).then(response => {
        if (!response.ok && response.status !== 404) { // Don't log 404s as they're common
          console.warn(`Supabase response not OK: ${response.status} for ${url}`);
        }
        return response;
      }).catch(error => {
        console.error(`Network error with Supabase request to ${url}:`, error);
        throw error;
      });
    }
  }
};

// Create Supabase client with Database type to ensure type safety
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, options);

// Helper function to check if there's an active connection
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};

// Helper to get current session with better error handling
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Exception getting session:', error);
    return null;
  }
};

// Add a utility function to fetch user profile by ID with improved caching and logging
export const fetchProfileById = async (userId: string) => {
  try {
    if (!userId) {
      console.error('fetchProfileById called with empty userId');
      return null;
    }

    // Creating in-memory cache for profile fetching to reduce database queries
    if (!window.__profileCache) {
      window.__profileCache = {};
    }

    // Check if we have a cached profile and it's less than 5 minutes old
    const cachedProfile = window.__profileCache[userId];
    if (cachedProfile && Date.now() - cachedProfile.timestamp < 5 * 60 * 1000) {
      console.log(`Using cached profile for user ${userId}`);
      return cachedProfile.data;
    }

    console.log(`Fetching profile from database for user ${userId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      
      // If profile doesn't exist, attempt to create a minimal one using auth data
      if (error.code === 'PGRST116') {
        console.log(`Profile not found for ${userId}, attempting to fetch auth user data`);
        
        const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
        
        if (!authError && authData?.user) {
          console.log(`Got auth data for user ${userId}, creating minimal profile`);
          
          // Return minimal profile from auth data
          const minimalProfile = {
            id: userId,
            full_name: authData.user.user_metadata?.full_name || 
                      authData.user.user_metadata?.name || 
                      'Unknown User',
            avatar_url: authData.user.user_metadata?.avatar_url || null,
            created_at: authData.user.created_at
          };
          
          // Cache the minimal profile
          window.__profileCache[userId] = {
            data: minimalProfile,
            timestamp: Date.now()
          };
          
          return minimalProfile;
        }
      }
      
      return null;
    }
    
    console.log(`Successfully fetched profile for user ${userId}:`, data);
    
    // Cache the profile
    window.__profileCache[userId] = {
      data,
      timestamp: Date.now()
    };
    
    return data;
  } catch (error) {
    console.error(`Exception fetching profile for user ${userId}:`, error);
    return null;
  }
};

// Add the window extension for TypeScript
declare global {
  interface Window {
    __profileCache?: {
      [userId: string]: {
        data: any;
        timestamp: number;
      }
    }
  }
}
