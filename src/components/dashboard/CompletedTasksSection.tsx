
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Offer } from "@/types/offer";

interface CompletedTasksSectionProps {
  offers: Offer[];
}

export const CompletedTasksSection = ({ offers }: CompletedTasksSectionProps) => {
  const navigate = useNavigate();
  
  // Filter for completed tasks where provider has worked on
  const completedOffers = offers?.filter((offer) => 
    offer.status === 'completed' || offer.task?.status === 'completed'
  ) || [];
  
  if (completedOffers.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-teal-dark mb-3">Recently Completed Tasks</h2>
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 mb-6">
        {completedOffers.slice(0, 4).map((offer) => (
          <CompletedTaskCard 
            key={offer.id} 
            offer={offer}
            onClick={() => navigate(`/tasks/${offer.task_id}`)}
          />
        ))}
      </div>
    </>
  );
};

interface CompletedTaskCardProps {
  offer: Offer;
  onClick: () => void;
}

const CompletedTaskCard = ({ offer, onClick }: CompletedTaskCardProps) => {
  // Format the completion date if available
  const completionDate = offer.completed_at 
    ? new Date(offer.completed_at).toLocaleDateString() 
    : 'Recently';

  return (
    <Card 
      className="bg-white hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{offer.task?.title || "Task"}</h3>
            <p className="text-sm text-gray-600">Completed: {completionDate}</p>
          </div>
          <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
            Completed
          </div>
        </div>
        <p className="text-sm mt-1">
          Click to view task details and leave a review
        </p>
      </CardContent>
    </Card>
  );
};
