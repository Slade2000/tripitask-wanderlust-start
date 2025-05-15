
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
    
    // Instead of using RPC, query the reviews table directly
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', userId);
      
    if (error) {
      console.error("Error fetching user rating stats:", error);
      return { average_rating: 0, review_count: 0 };
    }
    
    if (!reviews || reviews.length === 0) {
      return { average_rating: 0, review_count: 0 };
    }
    
    // Calculate average rating manually
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const average = total / reviews.length;
    
    return {
      average_rating: Number(average.toFixed(1)),
      review_count: reviews.length
    };
  } catch (err) {
    console.error("Error in getUserRatingStats:", err);
    return { average_rating: 0, review_count: 0 };
  }
}
