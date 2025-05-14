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
  
  // Get the appropriate badge style and text based on task status
  const getBadgeStyleAndText = () => {
    // Check task status first (if available)
    if (offer.task?.status === 'pending_complete') {
      return {
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
        text: 'Pending Approval'
      };
    }
    
    // Otherwise use offer status
    if (offer.status === 'accepted') {
      return {
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
        text: 'In Progress'
      };
    }
    
    return {
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      text: 'Pending'
    };
  };
  
  const badgeInfo = getBadgeStyleAndText();
  
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
          <Badge className={badgeInfo.className}>
            {badgeInfo.text}
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
