
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { OfferCard } from "./OfferCard";

interface JobsTabContentProps {
  offers: any[];
  type: 'active-jobs' | 'offers-made';
}

export const JobsTabContent = ({ offers, type }: JobsTabContentProps) => {
  const navigate = useNavigate();
  
  // Filter offers based on tab type
  const filteredOffers = type === 'active-jobs' 
    ? offers.filter(offer => offer.status === 'accepted')
    : offers.filter(offer => offer.status === 'pending');
  
  if (filteredOffers.length === 0) {
    return (
      <Card className="bg-white p-6 text-center">
        <CardContent className="p-0">
          <p className="text-gray-600 mb-4">
            {type === 'active-jobs' 
              ? "No active jobs right now." 
              : "You haven't made any offers yet."}
          </p>
          <Button 
            onClick={() => navigate("/find-work")} 
            className="bg-teal hover:bg-teal-dark text-white"
          >
            {type === 'active-jobs' 
              ? "Find New Tasks" 
              : "Find Tasks to Bid On"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // For debugging - show the task status in the console
  console.log("Offers with task status:", filteredOffers.map(offer => ({
    id: offer.id,
    taskTitle: offer.task?.title,
    taskStatus: offer.task?.status
  })));

  return (
    <div className="space-y-3">
      {filteredOffers.slice(0, 3).map(offer => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
      {filteredOffers.length > 3 && (
        <div className="text-center">
          <Button 
            variant="ghost" 
            className="text-teal" 
            onClick={() => navigate('/my-jobs')}
          >
            View All ({filteredOffers.length}) {type === 'active-jobs' ? 'Jobs' : 'Offers'}
          </Button>
        </div>
      )}
    </div>
  );
};
