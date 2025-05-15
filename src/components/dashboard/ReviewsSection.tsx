
import { Card, CardContent } from "@/components/ui/card";
import { ReviewCard } from "./ReviewCard";

interface Review {
  id: string;
  customerName: string;
  taskTitle: string;
  rating: number;
  comment: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

export const ReviewsSection = ({ reviews }: ReviewsSectionProps) => {
  return (
    <>
      <h2 className="text-xl font-semibold text-teal-dark mb-3">Recent Reviews</h2>
      {reviews.length > 0 ? (
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
