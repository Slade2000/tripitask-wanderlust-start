
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Star } from "@/components/reviews/Star";
import { Review } from "@/services/task/reviews/getTaskReviews";

interface ReviewItemProps {
  review: Review;
}

export function ReviewItem({ review }: ReviewItemProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">
            {review.reviewer?.full_name || 'Anonymous'}
          </CardTitle>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                filled={i < review.rating} 
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {review.feedback ? (
          <p className="text-sm">{review.feedback}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">No written feedback provided.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default ReviewItem;
