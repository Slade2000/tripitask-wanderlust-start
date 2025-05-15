
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
    
    // Instead of using RPC, directly query the reviews table to calculate statistics
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', userId);
      
    if (error) {
      console.error("Error fetching aggregate rating:", error);
      return null;
    }
    
    // If no reviews yet, return default values
    if (!data || data.length === 0) {
      return { average_rating: 0, review_count: 0 };
    }
    
    console.log("Aggregate rating data for user", userId, ":", data);
    
    // Calculate the average rating manually
    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    const average = data.length > 0 ? sum / data.length : 0;
    
    return {
      average_rating: Number(average.toFixed(1)), 
      review_count: data.length
    };
  } catch (err) {
    console.error("Exception in getUserAggregateRating:", err);
    return null;
  }
}
