
import { Button } from "@/components/ui/button";
import TaskOffersList from "./TaskOffersList";

interface TaskOffersSectionProps {
  taskId: string;
  isTaskPoster: boolean;
  offers: any[];
  offersLoading: boolean;
  onRefreshOffers: () => Promise<void>;
}

export default function TaskOffersSection({ 
  taskId,
  isTaskPoster,
  offers,
  offersLoading,
  onRefreshOffers
}: TaskOffersSectionProps) {
  // Only show offers section to task poster
  if (!isTaskPoster) {
    return null;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Offers</h2>
      <TaskOffersList 
        taskId={taskId || ''} 
        offers={offers}
        loading={offersLoading}
        onRefresh={onRefreshOffers}
      />
    </div>
  );
}
