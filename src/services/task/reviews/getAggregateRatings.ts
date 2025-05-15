
import { supabase } from "@/integrations/supabase/client";

interface RatingStats {
  average_rating: number;
  review_count: number;
}

/**
 * Gets a user's rating statistics (average rating and review count)
 * @param userId The ID of the user to get ratings for
 */
export async function getUserRatingStats(userId: string): Promise<RatingStats> {
  try {
    if (!userId) {
      console.error("getUserRatingStats called with empty userId");
      return { average_rating: 0, review_count: 0 };
    }
    
    // Call the database function we created in SQL
    const { data, error } = await supabase
      .rpc('get_user_rating_stats', { user_id: userId });
      
    if (error) {
      console.error("Error fetching user rating stats:", error);
      return { average_rating: 0, review_count: 0 };
    }
    
    // Function returns a single record with average_rating and review_count
    return {
      average_rating: data?.[0]?.average_rating || 0,
      review_count: data?.[0]?.review_count || 0
    };
  } catch (err) {
    console.error("Error in getUserRatingStats:", err);
    return { average_rating: 0, review_count: 0 };
  }
}
