
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
    
    if (!reviewerId || !revieweeId) {
      console.error("Missing required reviewer or reviewee ID", { reviewerId, revieweeId });
      toast.error("Cannot submit review: missing user information");
      return null;
    }
    
    // Validate the rating
    if (rating < 1 || rating > 5) {
      console.error("Invalid rating value:", rating);
      toast.error("Rating must be between 1 and 5 stars");
      return null;
    }
    
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
      toast.error(`Failed to submit review: ${error.message}`);
      return null;
    }
    
    console.log("Review submitted successfully:", data[0]);
    toast.success("Review submitted successfully!");
    return data[0];
  } catch (err) {
    console.error("Error submitting review:", err);
    toast.error("Error submitting review");
    return null;
  }
}
