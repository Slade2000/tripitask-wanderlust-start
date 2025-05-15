
import { supabase } from "@/integrations/supabase/client";
import { getUserRatingStats } from "@/services/task/reviews/getAggregateRatings";
import { Profile, certificationsToJson } from "@/contexts/auth/types";

// Re-export Profile type
export type { Profile } from "@/contexts/auth/types";

/**
 * Update a user's profile information
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<{ success: boolean; error: any }> => {
  try {
    // Convert Profile.certifications (Certificate[]) to Json for database storage
    const dbUpdates: any = { ...updates };
    
    // Convert certifications array to JSON format if present
    if (updates.certifications) {
      dbUpdates.certifications = certificationsToJson(updates.certifications);
    }

    const { error } = await supabase
      .from("profiles")
      .update(dbUpdates)
      .eq("id", userId);

    if (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("Exception updating profile:", err);
    return { success: false, error: err };
  }
};

/**
 * Function to update a user's profile (alias for updateProfile for compatibility)
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> => {
  const result = await updateProfile(userId, updates);
  if (result.success) {
    return await fetchProfileWithRatings(userId);
  }
  return null;
};

/**
 * Fetch a user's profile with their current rating stats
 */
export const fetchProfileWithRatings = async (
  userId: string
): Promise<Profile | null> => {
  try {
    // Get the base profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    // Get updated rating stats from the reviews table
    const ratingStats = await getUserRatingStats(userId);
    
    // Create profile with computed properties
    const profileData: Profile = {
      ...profile,
      // Convert JSON certifications to properly typed Certificate array
      certifications: profile.certifications,
      first_name: profile.full_name && profile.full_name.includes(' ') 
        ? profile.full_name.split(' ')[0] 
        : profile.full_name,
      last_name: profile.full_name && profile.full_name.includes(' ')
        ? profile.full_name.split(' ').slice(1).join(' ')
        : null,
      rating: ratingStats.average_rating,
      // Include other stats as needed
    };
    
    return profileData;
  } catch (err) {
    console.error("Exception fetching profile:", err);
    return null;
  }
};

/**
 * Subscribe to changes in the user's profile
 */
export const subscribeToProfileChanges = (userId: string, onUpdate: () => Promise<any>) => {
  return supabase
    .channel('profile-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      },
      (payload) => {
        console.log('Profile updated:', payload);
        onUpdate();
      }
    )
    .subscribe();
};
