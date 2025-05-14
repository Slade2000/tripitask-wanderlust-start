
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  task_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  feedback?: string;
  created_at: string;
  is_provider_review: boolean;
  reviewer?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  task?: {
    title: string;
  };
}

export async function getTaskReviews(taskId: string): Promise<Review[]> {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles(id, full_name, avatar_url)
      `)
      .eq('task_id', taskId);
      
    if (error) {
      console.error("Error fetching task reviews:", error);
      return [];
    }
    
    return reviews as unknown as Review[];
  } catch (err) {
    console.error("Error fetching task reviews:", err);
    return [];
  }
}
