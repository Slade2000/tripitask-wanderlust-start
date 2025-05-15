
import { supabase } from "@/integrations/supabase/client";
import { getUserRatingStats } from "@/services/task/reviews/getAggregateRatings";
import { Profile } from "./types";

// Re-export Profile type
export type { Profile } from "./types";

/**
 * Update a user's profile information
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<{ success: boolean; error: any }> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
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
    
    // Merge the profile with rating stats
    return {
      ...profile,
      rating: ratingStats.average_rating,
      // Include other stats as needed
    };
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
