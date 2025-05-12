
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

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
      return fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          // Add custom headers like for debugging if needed
        }
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

// Add a utility function to fetch user profile by ID
export const fetchProfileById = async (userId: string) => {
  try {
    if (!userId) {
      console.error('fetchProfileById called with empty userId');
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Exception fetching profile for user ${userId}:`, error);
    return null;
  }
};
