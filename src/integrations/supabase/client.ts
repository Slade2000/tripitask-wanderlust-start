
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

const SUPABASE_URL = "https://dftdrtfpvojruqkbzcuw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdGRydGZwdm9qcnVxa2J6Y3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNzcxMjMsImV4cCI6MjA1NjY1MzEyM30.C4iKGFhyx1GxzQqPg8wFkMdJjruEB5qYfW0eyqR9ck0";

// Set up persistent storage and better error handling
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  global: {
    // With better error handling using callbacks
    fetch: (url: RequestInfo | URL, options?: RequestInit) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          // Add custom headers like for debugging if needed
        }
      }).then(response => {
        return response;
      }).catch(error => {
        console.error(`Network error with Supabase request to ${url}:`, error);
        // We can add custom error handling here if needed
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

// Helper to get current session
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
