
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile } from '@/contexts/auth/types';
import { certificationsToJson, certificationsFromJson } from '@/contexts/auth/types';

/**
 * Updates a user's profile in the database
 */
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<Profile>
): Promise<Profile | null> => {
  try {
    // Create a data object for the update
    const dataToUpdate: Record<string, any> = {
      ...profileData,
      updated_at: new Date().toISOString(),
    };
    
    // Convert certificates array to JSON if present
    if (profileData.certifications !== undefined) {
      dataToUpdate.certifications = certificationsToJson(profileData.certifications);
    }
    
    const { data, error } = await supabase
      .from("profiles")
      .update(dataToUpdate)
      .eq("id", userId)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      throw error;
    }
    
    // Create profile with computed properties
    const updatedProfile: Profile = {
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
    
    toast.success("Profile updated successfully");
    return updatedProfile;
  } catch (err) {
    console.error("Exception updating profile:", err);
    toast.error("An unexpected error occurred");
    return null;
  }
};

/**
 * Sets up a real-time subscription for profile updates
 */
export const subscribeToProfileChanges = (
  userId: string, 
  onProfileChange: () => void
) => {
  const subscription = supabase
    .channel(`profile:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*', 
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      },
      async () => {
        console.log('Profile changed, refreshing...');
        onProfileChange();
      }
    )
    .subscribe();
  
  return subscription;
};
