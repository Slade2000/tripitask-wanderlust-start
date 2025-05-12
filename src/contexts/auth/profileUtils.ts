
import { supabase } from '../../integrations/supabase/client';
import { Profile } from './types';

// Fetch user profile
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  console.log(`Fetching profile for user: ${userId}`);
  
  if (!userId) {
    console.error('Cannot fetch profile: userId is null or undefined');
    return null;
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
    return null; // Return null instead of throwing error
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
    return null; // Return null instead of throwing error
  }
};
