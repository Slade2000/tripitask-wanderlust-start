
import { supabase } from '../../integrations/supabase/client';
import { Profile, certificationsFromJson, certificationsToJson } from './types';

// Set up a local cache for profile data
const profileCache: { [userId: string]: { profile: Profile, timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Fetch user profile with improved caching and error handling
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  console.log(`Fetching profile for user: ${userId}`);
  
  if (!userId) {
    console.error('Cannot fetch profile: userId is null or undefined');
    return null;
  }
  
  // Check cache first
  const now = Date.now();
  if (profileCache[userId] && now - profileCache[userId].timestamp < CACHE_DURATION) {
    console.log('Returning cached profile for user:', userId);
    return profileCache[userId].profile;
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      console.log('Error code:', error.code, 'Error message:', error.message);
      
      // Check if this is a "not found" error - if so, we may need to create a profile
      if (error.code === 'PGRST116') {
        console.log('Profile not found, attempting to create one...');
        return await createInitialProfile(userId);
      }
      
      return null; // Return null instead of throwing error
    }
    
    console.log('Profile data received:', data);
    
    // Create profile with computed properties instead of getters
    const profileData: Profile = {
      ...data,
      // Convert JSON certifications to properly typed Certificate array
      certifications: certificationsFromJson(data.certifications),
      first_name: data.full_name && data.full_name.includes(' ') 
        ? data.full_name.split(' ')[0] 
        : data.full_name,
      last_name: data.full_name && data.full_name.includes(' ')
        ? data.full_name.split(' ').slice(1).join(' ')
        : null
    };
    
    // Update cache
    profileCache[userId] = {
      profile: profileData,
      timestamp: now
    };
    
    return profileData;
  } catch (error) {
    console.error('Exception fetching profile:', error);
    return null; // Return null instead of throwing error
  }
};

// Clear cache for a specific user or all users
export const clearProfileCache = (userId?: string): void => {
  if (userId) {
    delete profileCache[userId];
  } else {
    // Clear all cache
    Object.keys(profileCache).forEach(key => delete profileCache[key]);
  }
};

// Create an initial profile if one doesn't exist
export const createInitialProfile = async (userId: string): Promise<Profile | null> => {
  console.log(`Creating initial profile for user: ${userId}`);
  try {
    // Get user details from auth to use as initial data
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user details for profile creation:', userError);
      console.log('Error code:', userError.code, 'Error message:', userError.message);
      return null;
    }

    if (!userData.user || userData.user.id !== userId) {
      console.error('User data mismatch or missing during profile creation');
      console.log('User from getUser:', userData.user?.id, 'Expected userId:', userId);
      return null;
    }
    
    // Prepare initial profile data
    const initialData = {
      id: userId,
      full_name: userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || null,
      avatar_url: userData.user.user_metadata?.avatar_url || null,
      services: [],
      about: '',
      location: '',
      business_name: '',
      rating: 0,
      jobs_completed: 0,
      certifications: [] // Empty array for certifications
    };
    
    console.log('Attempting to create profile with data:', initialData);
    
    // Insert the initial profile
    const { data, error } = await supabase
      .from('profiles')
      .insert([initialData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating initial profile:', error);
      console.log('Error code:', error.code, 'Error message:', error.message);
      return null;
    }
    
    console.log('Initial profile created successfully:', data);
    
    // Create profile with computed properties
    const profileData: Profile = {
      ...data,
      // Convert JSON certifications to properly typed Certificate array
      certifications: certificationsFromJson(data.certifications),
      first_name: data.full_name && data.full_name.includes(' ') 
        ? data.full_name.split(' ')[0] 
        : data.full_name,
      last_name: data.full_name && data.full_name.includes(' ')
        ? data.full_name.split(' ').slice(1).join(' ')
        : null
    };
    
    // Update cache
    profileCache[userId] = {
      profile: profileData,
      timestamp: Date.now()
    };
    
    return profileData;
  } catch (error) {
    console.error('Exception creating initial profile:', error);
    return null; // Return null instead of throwing error
  }
};
