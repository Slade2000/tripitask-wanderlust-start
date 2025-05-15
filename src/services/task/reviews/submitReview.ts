
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReviewData {
  taskId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  feedback?: string;
  isProviderReview: boolean;
}

export async function submitReview(reviewData: ReviewData) {
  try {
    const { taskId, reviewerId, revieweeId, rating, feedback, isProviderReview } = reviewData;
    
    console.log("Submitting review with data:", reviewData);
    
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        task_id: taskId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        feedback,
        is_provider_review: isProviderReview
      })
      .select();
      
    if (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
      return null;
    }
    
    toast.success("Review submitted successfully!");
    return data[0];
  } catch (err) {
    console.error("Error submitting review:", err);
    toast.error("Error submitting review");
    return null;
  }
}
