
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ReviewCardProps {
  review: {
    id: string;
    customerName: string;
    taskTitle: string;
    rating: number;
    comment: string;
  };
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <Card key={review.id} className="bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-1">
          <p className="font-medium">{review.customerName}</p>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-2">{review.taskTitle}</p>
        <p className="text-sm">{review.comment}</p>
      </CardContent>
    </Card>
  );
};
