
import { Button } from "@/components/ui/button";
import TaskOffersList from "./TaskOffersList";
import { useState, useEffect } from "react";

interface TaskOffersSectionProps {
  taskId: string;
  isTaskPoster: boolean;
  offers: any[];
  onRefreshOffers: () => Promise<void>;
  onTaskUpdated?: (task: any) => void; // Added this prop
  userId?: string; // Added this optional prop
  taskStatus?: any; // Added this optional prop
}

export default function TaskOffersSection({ 
  taskId,
  isTaskPoster,
  offers,
  onRefreshOffers,
  onTaskUpdated, // Added this prop
  userId, // Added this prop
  taskStatus // Added this prop
}: TaskOffersSectionProps) {
  const [offersLoading, setOffersLoading] = useState(false);
  
  // Show offers section to everyone, but only task poster can see the actions
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Offers</h2>
      <TaskOffersList 
        taskId={taskId} 
        offers={offers}
        loading={offersLoading}
        onRefresh={onRefreshOffers}
        isTaskPoster={isTaskPoster}
        userId={userId}
        taskStatus={taskStatus}
        onTaskUpdated={onTaskUpdated}
      />
    </div>
  );
}
