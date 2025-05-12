
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Review {
  reviewer: string;
  task: string;
  rating: number;
  feedback: string;
}

interface ReviewsTabProps {
  reviews: Review[];
}

const ReviewsTab = ({ reviews }: ReviewsTabProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Recent Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((review, index) => (
          <div key={index} className="pb-4">
            <div className="flex justify-between mb-1">
              <h3 className="font-medium">{review.reviewer}</h3>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">{review.task}</p>
            <p className="text-sm">{review.feedback}</p>
            {index < reviews.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ReviewsTab;
