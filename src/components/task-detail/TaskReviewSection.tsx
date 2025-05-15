
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useProfile } from "@/contexts/profile";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { getTaskReviews } from "@/services/task/reviews";
import { SubmitReviewForm } from "@/components/reviews/SubmitReviewForm";
import { ReviewItem } from "@/components/reviews/ReviewItem";
import { Review } from "@/services/task/reviews/getTaskReviews";

interface TaskReviewSectionProps {
  task: any;
  isTaskPoster: boolean;
  providerDetails: any;
}

export default function TaskReviewSection({
  task,
  isTaskPoster,
  providerDetails,
}: TaskReviewSectionProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Get current user's role in this task
  const isProvider = !isTaskPoster && providerDetails?.id === user?.id;
  const hasTaskCompleted = task.status === 'completed';

  // Provider and client IDs
  const clientId = task.user_id;
  const providerId = providerDetails?.id;

  useEffect(() => {
    const loadReviews = async () => {
      if (!task.id) return;
      
      try {
        console.log("Loading reviews for task:", task.id);
        const reviewsData = await getTaskReviews(task.id);
        console.log("Task reviews loaded:", reviewsData);
        setReviews(reviewsData);
        
        // Check if current user has already submitted a review
        const userReview = reviewsData.find(review => review.reviewer_id === user?.id);
        console.log("Current user has submitted review:", !!userReview, "User ID:", user?.id);
        setShowReviewForm(!userReview && hasTaskCompleted);
      } catch (error) {
        console.error("Error loading reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (hasTaskCompleted) {
      loadReviews();
    } else {
      setLoading(false);
      setShowReviewForm(false);
    }
  }, [task.id, user?.id, hasTaskCompleted]);

  // If task isn't completed, don't show review section
  if (!hasTaskCompleted) {
    return null;
  }
  
  // Check if both parties have submitted reviews
  const bothPartiesReviewed = reviews.length >= 2;
  
  // Get the other person's name (who the current user would be reviewing)
  const revieweeName = isTaskPoster 
    ? (providerDetails?.full_name || 'Service Provider') 
    : (task.poster_name || 'Client');
  
  // Determine who the current user should review
  const revieweeId = isTaskPoster ? providerId : clientId;
  
  // Enhanced logging to debug review information
  console.log("Review section details:", {
    isTaskPoster,
    isProvider,
    clientId,
    providerId,
    currentUserId: user?.id,
    reviewCount: reviews.length,
    taskStatus: task.status,
    revieweeId,
    providerDetails: providerDetails ? 
      {id: providerDetails.id, name: providerDetails.full_name} : 
      "Missing provider details",
    task: {
      id: task.id, 
      user_id: task.user_id,
      poster_name: task.poster_name
    }
  });
  
  // Determine current user's ID for the review
  const currentUserId = user?.id || '';
  
  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    toast.success("Your review was submitted successfully!");
    // Refresh reviews list
    getTaskReviews(task.id).then(newReviews => {
      setReviews(newReviews);
    });
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Reviews</h3>
      
      {loading ? (
        <Card>
          <CardContent className="p-4">
            <p>Loading review information...</p>
          </CardContent>
        </Card>
      ) : showReviewForm ? (
        revieweeId ? (
          <SubmitReviewForm
            taskId={task.id}
            reviewerId={currentUserId}
            revieweeId={revieweeId}
            isProviderReview={isProvider}
            taskTitle={task.title}
            revieweeName={revieweeName}
            onReviewSubmitted={handleReviewSubmitted}
          />
        ) : (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-amber-700">
                Cannot submit review: missing recipient information.
                {isTaskPoster ? 
                  " Provider details could not be loaded." : 
                  " Task poster details could not be loaded."}
              </p>
            </CardContent>
          </Card>
        )
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {bothPartiesReviewed ? (
            reviews.map(review => (
              <ReviewItem key={review.id} review={review} />
            ))
          ) : (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-gray-600">
                  Reviews will be visible once both parties have submitted their feedback.
                </p>
                {reviews.find(review => review.reviewer_id === currentUserId) && (
                  <p className="text-sm text-green-600 mt-2">
                    You've submitted your review. Waiting for the other party to complete theirs.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-gray-600">No reviews have been submitted yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
