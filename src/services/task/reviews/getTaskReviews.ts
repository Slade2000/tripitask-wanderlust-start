
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/user";

export interface Review {
  id: string;
  task_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  feedback?: string;
  created_at: string;
  is_provider_review: boolean;
  reviewer?: Profile;
}

export async function getTaskReviews(taskId: string): Promise<Review[]> {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id(id, full_name, avatar_url)
      `)
      .eq('task_id', taskId);
      
    if (error) {
      console.error("Error fetching task reviews:", error);
      return [];
    }
    
    return reviews || [];
  } catch (err) {
    console.error("Error fetching task reviews:", err);
    return [];
  }
}
