
import TaskOffersSection from "./TaskOffersSection";

interface TaskOffersContainerProps {
  taskId: string;
  offers: any[];
  isTaskPoster: boolean;
  onTaskUpdated: (task: any) => void;
  onRefreshOffers: () => Promise<void>;
  userId: string;
  taskStatus: string;
}

export default function TaskOffersContainer({
  taskId,
  offers,
  isTaskPoster,
  onTaskUpdated,
  onRefreshOffers,
  userId,
  taskStatus
}: TaskOffersContainerProps) {
  // Only show if user is task poster or has made an offer
  const userHasMadeOffer = offers?.some(offer => offer.provider_id === userId);
  
  if (!isTaskPoster && !userHasMadeOffer) {
    return null;
  }

  return (
    <div className="mt-6">
      <TaskOffersSection
        taskId={taskId}
        offers={offers}
        isTaskPoster={isTaskPoster}
        onTaskUpdated={onTaskUpdated}
        onRefreshOffers={onRefreshOffers}
        userId={userId}
        taskStatus={taskStatus}
      />
    </div>
  );
}
