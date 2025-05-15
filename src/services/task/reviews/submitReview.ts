
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
    
    // Enhanced validation with better error messages
    if (!reviewerId) {
      console.error("Missing reviewer ID in submitReview");
      toast.error("Cannot submit review: you must be logged in");
      return null;
    }
    
    if (!revieweeId) {
      console.error("Missing reviewee ID in submitReview");
      toast.error("Cannot submit review: missing recipient information");
      return null;
    }
    
    if (!taskId) {
      console.error("Missing task ID in submitReview");
      toast.error("Cannot submit review: task information missing");
      return null;
    }
    
    // Validate the rating
    if (rating < 1 || rating > 5) {
      console.error("Invalid rating value:", rating);
      toast.error("Rating must be between 1 and 5 stars");
      return null;
    }
    
    // First check if a review already exists from this reviewer for this task
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('id')
      .eq('task_id', taskId)
      .eq('reviewer_id', reviewerId)
      .limit(1);
      
    if (checkError) {
      console.error("Error checking for existing review:", checkError);
    } else if (existingReview && existingReview.length > 0) {
      toast.error("You've already submitted a review for this task");
      return null;
    }
    
    // Submit the review
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
    
    // Update the user's rating in their profile
    await updateUserRatingInProfile(revieweeId);
    
    return data[0];
  } catch (err) {
    console.error("Error submitting review:", err);
    toast.error("Error submitting review");
    return null;
  }
}

async function updateUserRatingInProfile(userId: string) {
  try {
    // Get the latest rating stats
    const { data, error } = await supabase
      .rpc('get_user_rating_stats', { user_id: userId });
      
    if (error || !data) {
      console.error("Error getting updated rating stats:", error);
      return;
    }
    
    // Update the profile with the new rating and increment jobs_completed
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        rating: data.average_rating || 0,
        // Don't update jobs_completed here, as that's handled by task completion
      })
      .eq('id', userId);
      
    if (updateError) {
      console.error("Error updating profile with new rating:", updateError);
    } else {
      console.log("Updated user profile with new rating:", data.average_rating);
    }
  } catch (err) {
    console.error("Error updating profile rating:", err);
  }
}
