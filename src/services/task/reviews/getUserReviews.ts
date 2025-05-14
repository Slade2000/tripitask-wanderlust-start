
import { supabase } from "@/integrations/supabase/client";
import { Review } from "./getTaskReviews";

export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles(id, full_name, avatar_url),
        task:tasks(title)
      `)
      .eq('reviewee_id', userId);
      
    if (error) {
      console.error("Error fetching user reviews:", error);
      return [];
    }
    
    return reviews as unknown as Review[];
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    return [];
  }
}
