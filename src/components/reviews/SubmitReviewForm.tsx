
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { submitReview } from "@/services/task/reviews";
import { toast } from "sonner";

interface SubmitReviewFormProps {
  taskId: string;
  reviewerId: string;
  revieweeId: string;
  isProviderReview: boolean;
  taskTitle: string;
  revieweeName: string;
  onReviewSubmitted: () => void;
}

export function SubmitReviewForm({
  taskId,
  reviewerId,
  revieweeId,
  isProviderReview,
  taskTitle,
  revieweeName,
  onReviewSubmitted
}: SubmitReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Log props for debugging
  useEffect(() => {
    console.log("SubmitReviewForm props:", { 
      taskId, 
      reviewerId, 
      revieweeId,
      isProviderReview,
      taskTitle,
      revieweeName 
    });
  }, [taskId, reviewerId, revieweeId, isProviderReview, taskTitle, revieweeName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!revieweeId) {
      toast.error("Cannot submit review: missing recipient information");
      return;
    }
    
    if (!reviewerId) {
      toast.error("Cannot submit review: you must be logged in");
      return;
    }
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting review with data:", {
        taskId,
        reviewerId,
        revieweeId,
        rating,
        feedback: feedback ? `${feedback.substring(0, 20)}...` : "(empty)",
        isProviderReview
      });
      
      const result = await submitReview({
        taskId,
        reviewerId,
        revieweeId,
        rating,
        feedback,
        isProviderReview
      });
      
      if (result) {
        console.log("Review submitted successfully:", result);
        toast.success("Review submitted successfully");
        onReviewSubmitted();
      } else {
        console.error("Failed to submit review, no result returned");
        toast.error("Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("An error occurred while submitting your review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
        <CardDescription>
          {isProviderReview 
            ? `How was your experience working with ${revieweeName}?` 
            : `How was ${revieweeName}'s work on "${taskTitle}"?`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star 
                    className={`h-6 w-6 ${
                      (hoverRating ? star <= hoverRating : star <= rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`} 
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 ? `${rating} out of 5` : "Select a rating"}
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Your Review (Optional)</p>
            <Textarea
              placeholder="Share your experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || rating === 0 || !revieweeId || !reviewerId}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
          
          {!revieweeId && (
            <p className="text-sm text-red-500 text-center">
              Cannot submit review: missing recipient information
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
