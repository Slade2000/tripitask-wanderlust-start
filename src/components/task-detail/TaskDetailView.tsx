
import { useRef } from "react";
import { useAuth } from "@/contexts/auth";
import MessageModal from "../messages/MessageModal";
import TaskDetailHeader from "./TaskDetailHeader";
import TaskDetailMain from "./TaskDetailMain";
import TaskDetailSidebar from "./TaskDetailSidebar";
import TaskOffersContainer from "./TaskOffersContainer";

interface TaskDetailViewProps {
  task: any;
  offers: any[];
  isTaskPoster: boolean;
  hasAcceptedOffer: boolean;
  isCurrentUserProvider: boolean;
  isMessageModalOpen: boolean;
  onOpenMessageModal: () => void;
  onCloseMessageModal: () => void;
  onTaskUpdated: (task: any) => void;
  onRefreshOffers: () => void;
  providerDetails?: any;
}

const TaskDetailView = ({
  task,
  offers,
  isTaskPoster,
  hasAcceptedOffer,
  isCurrentUserProvider,
  isMessageModalOpen,
  onOpenMessageModal,
  onCloseMessageModal,
  onTaskUpdated,
  onRefreshOffers,
  providerDetails
}: TaskDetailViewProps) => {
  const { user } = useAuth();
  const messageModalRef = useRef<HTMLDivElement>(null);

  // Find accepted offer if provider details weren't passed directly
  const acceptedOffer = offers?.find(offer => 
    offer.status === 'accepted' || 
    offer.status === 'work_completed' || 
    offer.status === 'completed'
  );
  
  // Use passed provider details or fall back to the one from the accepted offer
  const finalProviderDetails = providerDetails || acceptedOffer?.provider_details || null;
  
  // Log provider details to help with debugging
  console.log("TaskDetailView - Provider Details:", finalProviderDetails ? {
    id: finalProviderDetails.id,
    name: finalProviderDetails.full_name,
    hasDetails: Boolean(finalProviderDetails)
  } : "No provider details available");
  
  console.log("TaskDetailView - Task Status:", task.status);
  console.log("TaskDetailView - Current User:", {
    isTaskPoster,
    isCurrentUserProvider,
    userId: user?.id
  });
  
  // Make an async function to refresh offers - to fix the Promise return type error
  const handleRefreshOffers = async () => {
    return Promise.resolve(onRefreshOffers());
  };

  return (
    <div className="bg-cream min-h-screen pb-20">
      <div className="container mx-auto max-w-4xl p-4">
        <TaskDetailHeader
          title={task.title}
          status={task.status}
          budget={task.budget}
          date={task.date}
          location={task.location}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Main content */}
          <TaskDetailMain
            task={task}
            isTaskPoster={isTaskPoster}
            providerDetails={finalProviderDetails}
          />

          {/* Sidebar */}
          <TaskDetailSidebar
            task={task}
            offers={offers}
            isTaskPoster={isTaskPoster}
            onOpenMessageModal={onOpenMessageModal}
            onTaskUpdated={onTaskUpdated}
            hasAcceptedOffer={hasAcceptedOffer}
            isCurrentUserProvider={isCurrentUserProvider}
            user={user}
          />
        </div>

        {/* Offers Section (only visible to task poster or if user has made an offer) */}
        {user && (
          <TaskOffersContainer
            taskId={task.id}
            offers={offers}
            isTaskPoster={isTaskPoster}
            onTaskUpdated={onTaskUpdated}
            onRefreshOffers={handleRefreshOffers}
            userId={user.id}
            taskStatus={task.status}
          />
        )}

        {/* Message Modal */}
        {isMessageModalOpen && (
          <div ref={messageModalRef}>
            <MessageModal
              isOpen={isMessageModalOpen}
              onClose={onCloseMessageModal}
              receiverId={isTaskPoster ? finalProviderDetails?.id : task.user_id}
              taskId={task.id}
              taskTitle={task.title}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskDetailView;
