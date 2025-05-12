
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
      return null;
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
    return null;
  }
};
