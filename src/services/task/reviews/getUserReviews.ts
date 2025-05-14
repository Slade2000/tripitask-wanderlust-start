
import { supabase } from "@/integrations/supabase/client";
import { Review } from "./getTaskReviews";

export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id(id, full_name, avatar_url),
        task:task_id(title)
      `)
      .eq('reviewee_id', userId);
      
    if (error) {
      console.error("Error fetching user reviews:", error);
      return [];
    }
    
    return reviews as Review[];
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    return [];
  }
}
