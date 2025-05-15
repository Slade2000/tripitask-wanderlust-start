
import { supabase } from "@/integrations/supabase/client";
import { Review } from "./getTaskReviews";

export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    console.log("Fetching reviews for user:", userId);
    
    if (!userId) {
      console.error("getUserReviews called with empty userId");
      return [];
    }
    
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id(id, full_name, avatar_url),
        reviewee:reviewee_id(id, full_name, avatar_url),
        task:task_id(id, title)
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching user reviews:", error);
      return [];
    }
    
    console.log(`Found ${reviews.length} reviews for user ${userId}:`, reviews);
    return reviews as unknown as Review[];
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    return [];
  }
}
