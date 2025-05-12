
import { supabase } from '../../integrations/supabase/client';
import { Profile } from './types';

// Fetch user profile
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  console.log(`Fetching profile for user: ${userId}`);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      
      // Check if this is a "not found" error - if so, we may need to create a profile
      if (error.code === 'PGRST116') {
        console.log('Profile not found, attempting to create one...');
        return await createInitialProfile(userId);
      }
      
      throw error; // Let the error be caught by the caller
    }
    
    console.log('Profile data received:', data);
    
    // Create profile with computed properties instead of getters
    const profileData = {
      ...data,
      first_name: data.full_name && data.full_name.includes(' ') 
        ? data.full_name.split(' ')[0] 
        : data.full_name,
      last_name: data.full_name && data.full_name.includes(' ')
        ? data.full_name.split(' ').slice(1).join(' ')
        : null
    } as Profile;
    
    return profileData;
  } catch (error) {
    console.error('Exception fetching profile:', error);
    throw error; // Let the error be caught by the caller
  }
};

// Create an initial profile if one doesn't exist
export const createInitialProfile = async (userId: string): Promise<Profile | null> => {
  console.log(`Creating initial profile for user: ${userId}`);
  try {
    // Get user details from auth to use as initial data
    // Using getUserById without admin as that requires special privileges
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user details for profile creation:', userError);
      throw userError;
    }

    if (!userData.user || userData.user.id !== userId) {
      console.error('User data mismatch or missing during profile creation');
      throw new Error('Unable to create profile: user data mismatch');
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
      throw error;
    }
    
    console.log('Initial profile created successfully:', data);
    
    // Create profile with computed properties
    const profileData = {
      ...data,
      first_name: data.full_name && data.full_name.includes(' ') 
        ? data.full_name.split(' ')[0] 
        : data.full_name,
      last_name: data.full_name && data.full_name.includes(' ')
        ? data.full_name.split(' ').slice(1).join(' ')
        : null
    } as Profile;
    
    return profileData;
  } catch (error) {
    console.error('Exception creating initial profile:', error);
    throw error; // Let the error be caught by the caller
  }
};
