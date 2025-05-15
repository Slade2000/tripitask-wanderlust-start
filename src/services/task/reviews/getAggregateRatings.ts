
import { supabase } from "@/integrations/supabase/client";

interface RatingStats {
  average_rating: number;
  review_count: number;
}

/**
 * Get a user's average rating and total review count from the database
 * Uses direct SQL query since the custom function approach is causing type errors
 */
export async function getUserRatingStats(userId: string): Promise<RatingStats> {
  try {
    if (!userId) {
      console.error("getUserRatingStats called with empty userId");
      return { average_rating: 0, review_count: 0 };
    }

    // Use direct query instead of RPC function
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', userId);

    if (error) {
      console.error("Error fetching user rating stats:", error);
      return { average_rating: 0, review_count: 0 };
    }

    // Calculate stats manually
    if (data && data.length > 0) {
      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      const avg = sum / data.length;
      
      return {
        average_rating: Number(avg.toFixed(1)),
        review_count: data.length
      };
    }

    return { average_rating: 0, review_count: 0 };
  } catch (err) {
    console.error("Error in getUserRatingStats:", err);
    return { average_rating: 0, review_count: 0 };
  }
}

/**
 * Alternative implementation that uses direct SQL for when the function isn't available
 */
export async function calculateUserRatingStats(userId: string): Promise<RatingStats> {
  try {
    if (!userId) {
      console.error("calculateUserRatingStats called with empty userId");
      return { average_rating: 0, review_count: 0 };
    }
    
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', userId);
      
    if (error) {
      console.error("Error calculating user rating stats:", error);
      return { average_rating: 0, review_count: 0 };
    }
    
    if (data && data.length > 0) {
      // Calculate average manually
      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      const avg = sum / data.length;
      
      return {
        average_rating: Number(avg.toFixed(1)),
        review_count: data.length
      };
    }
    
    return { average_rating: 0, review_count: 0 };
  } catch (err) {
    console.error("Error in calculateUserRatingStats:", err);
    return { average_rating: 0, review_count: 0 };
  }
}
