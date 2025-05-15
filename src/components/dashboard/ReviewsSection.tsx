
import { Card, CardContent } from "@/components/ui/card";
import { ReviewCard } from "./ReviewCard";
import { Review } from "@/services/task/reviews/getTaskReviews";

interface ReviewsSectionProps {
  reviews: {
    id: string;
    customerName: string;
    taskTitle: string;
    rating: number;
    comment: string;
  }[];
  isLoading?: boolean;
  error?: unknown;
}

export const ReviewsSection = ({ reviews, isLoading = false, error = null }: ReviewsSectionProps) => {
  // Display an error if something went wrong during fetch
  if (error) {
    console.error("Error loading reviews:", error);
    return (
      <>
        <h2 className="text-xl font-semibold text-teal-dark mb-3">Recent Reviews</h2>
        <Card className="mb-6">
          <CardContent className="p-4 text-center">
            <p className="text-amber-700">Could not load reviews. Please try again later.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  // Show loading state when reviews are being fetched
  if (isLoading) {
    return (
      <>
        <h2 className="text-xl font-semibold text-teal-dark mb-3">Recent Reviews</h2>
        <Card className="mb-6">
          <CardContent className="p-4 text-center">
            <p className="text-gray-600">Loading reviews...</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-teal-dark mb-3">Recent Reviews</h2>
      {reviews && reviews.length > 0 ? (
        <div className="mb-6 grid gap-3 grid-cols-1 md:grid-cols-2">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-4 text-center">
            <p className="text-gray-600">No reviews yet. Complete jobs to get reviews!</p>
          </CardContent>
        </Card>
      )}
    </>
  );
};
