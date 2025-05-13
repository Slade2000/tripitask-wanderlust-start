
import { Button } from "@/components/ui/button";
import TaskOffersList from "./TaskOffersList";
import { useState, useEffect } from "react";

interface TaskOffersSectionProps {
  taskId: string;
  isTaskPoster: boolean;
  offers: any[];
  onRefreshOffers: () => Promise<void>;
}

export default function TaskOffersSection({ 
  taskId,
  isTaskPoster,
  offers,
  onRefreshOffers
}: TaskOffersSectionProps) {
  const [offersLoading, setOffersLoading] = useState(false);
  
  // Only show offers section to task poster
  if (!isTaskPoster) {
    return null;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Offers</h2>
      <TaskOffersList 
        taskId={taskId} 
        offers={offers}
        loading={offersLoading}
        onRefresh={onRefreshOffers}
      />
    </div>
  );
}
