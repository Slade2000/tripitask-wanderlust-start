
import { format } from "date-fns";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OfferCardProps {
  offer: any;
}

export const OfferCard = ({ offer }: OfferCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      key={offer.id} 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/tasks/${offer.task_id}`)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-teal-dark">
              {offer.task?.title || "Untitled Task"}
            </h3>
            <p className="text-sm text-gray-600">
              {offer.status === 'accepted' ? 'Amount:' : 'Your Offer:'} ${offer.amount}
            </p>
          </div>
          <Badge 
            className={
              offer.status === 'accepted' 
                ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
            }
          >
            {offer.status === 'accepted' ? 'In Progress' : 'Pending'}
          </Badge>
        </div>
        <div className="text-sm text-gray-600 mb-3 flex items-center">
          <Send className="h-4 w-4 mr-1" />
          <span>
            {offer.status === 'accepted' 
              ? `Due: ${format(new Date(offer.expected_delivery_date), 'dd MMM yyyy')}`
              : `Offer sent: ${format(new Date(offer.created_at), 'dd MMM yyyy')}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
