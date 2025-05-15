
import { supabase } from "@/integrations/supabase/client";

interface RatingStats {
  average_rating: number;
  review_count: number;
}

/**
 * Gets the aggregate rating statistics for a user
 * @param userId The ID of the user to get ratings for
 * @returns Promise with the average rating and review count
 */
export async function getUserAggregateRating(userId: string): Promise<RatingStats | null> {
  try {
    if (!userId) {
      console.error("getUserAggregateRating called with empty userId");
      return null;
    }
    
    console.log("Fetching aggregate rating for user:", userId);
    
    const { data, error } = await supabase
      .rpc('get_user_rating_stats', { user_id: userId });
      
    if (error) {
      console.error("Error fetching aggregate rating:", error);
      return null;
    }
    
    // If no reviews yet, return default values
    if (!data) {
      return { average_rating: 0, review_count: 0 };
    }
    
    console.log("Aggregate rating data for user", userId, ":", data);
    
    return {
      average_rating: data.average_rating || 0, 
      review_count: data.review_count || 0
    };
  } catch (err) {
    console.error("Exception in getUserAggregateRating:", err);
    return null;
  }
}
