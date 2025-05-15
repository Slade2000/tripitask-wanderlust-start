
import { supabase } from "@/integrations/supabase/client";
import { Review } from "./getTaskReviews";

export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    console.log("Fetching reviews for user:", userId);
    
    if (!userId) {
      console.error("getUserReviews called with empty userId");
      return [];
    }
    
    // Now we can use foreign key relationships with our new constraints
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        task_id,
        reviewer_id,
        reviewee_id,
        rating,
        feedback,
        created_at,
        is_provider_review,
        reviewer:profiles!reviewer_id(*),
        reviewee:profiles!reviewee_id(*),
        task:tasks!task_id(*)
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching user reviews:", error);
      return [];
    }
    
    console.log(`Found ${reviews?.length || 0} reviews for user ${userId}:`, reviews);
    return reviews as unknown as Review[] || [];
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    return [];
  }
}
