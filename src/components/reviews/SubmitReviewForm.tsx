
import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await submitReview({
        taskId,
        reviewerId,
        revieweeId,
        rating,
        feedback,
        isProviderReview
      });
      
      if (result) {
        toast.success("Review submitted successfully");
        onReviewSubmitted();
      } else {
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
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
