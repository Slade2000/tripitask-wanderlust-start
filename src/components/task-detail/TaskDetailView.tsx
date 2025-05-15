
import { useRef } from "react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TaskDetailHeader from "./TaskDetailHeader";
import TaskBasicInfo from "./TaskBasicInfo";
import TaskDescription from "./TaskDescription";
import TaskImageGallery from "./TaskImageGallery";
import TaskPosterInfo from "./TaskPosterInfo";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskActionSection from "./TaskActionSection";
import TaskOffersSection from "./TaskOffersSection";
import MessageModal from "../messages/MessageModal";
import TaskReviewSection from "./TaskReviewSection";

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
  onRefreshOffers
}: TaskDetailViewProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const messageModalRef = useRef<HTMLDivElement>(null);

  // Find accepted offer and provider details if available
  const acceptedOffer = offers?.find(offer => offer.status === 'accepted' || offer.status === 'completed');
  const providerDetails = acceptedOffer?.provider_details || null;

  return (
    <div className="bg-cream min-h-screen pb-20">
      <div className="container mx-auto max-w-4xl p-4">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        {/* Task Header */}
        <TaskDetailHeader
          title={task.title}
          status={task.status}
          budget={task.budget}
          date={task.date}
          location={task.location}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Task Details</h3>
                <TaskStatusBadge status={task.status} />
              </div>

              <TaskBasicInfo
                category={task.category}
                date={task.date}
                location={task.location}
                budget={task.budget}
              />
              
              <TaskDescription description={task.description} />

              {task.photos && task.photos.length > 0 && (
                <TaskImageGallery photos={task.photos} />
              )}
            </div>

            {/* Review Section (only visible after task is completed) */}
            {task.status === 'completed' && (
              <TaskReviewSection 
                task={task}
                isTaskPoster={isTaskPoster}
                providerDetails={providerDetails}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Poster Info */}
            <TaskPosterInfo
              name={task.poster_name}
              rating={task.poster_rating}
              memberSince={task.poster_member_since}
              location={task.poster_location}
              avatar={task.poster_avatar}
            />

            {/* Task Actions */}
            {user && (
              <TaskActionSection
                task={task}
                offers={offers}
                isTaskPoster={isTaskPoster}
                onOpenMessageModal={onOpenMessageModal}
                onTaskUpdated={onTaskUpdated}
                hasAcceptedOffer={hasAcceptedOffer}
                isCurrentUserProvider={isCurrentUserProvider}
              />
            )}
          </div>
        </div>

        {/* Offers Section (only visible to task poster or if user has made an offer) */}
        {user && (isTaskPoster || offers?.some(offer => offer.provider_id === user.id)) && (
          <div className="mt-6">
            <TaskOffersSection 
              taskId={task.id}
              offers={offers}
              isTaskPoster={isTaskPoster}
              onTaskUpdated={onTaskUpdated}
              onRefreshOffers={onRefreshOffers}
              userId={user.id}
              taskStatus={task.status}
            />
          </div>
        )}

        {/* Message Modal */}
        {isMessageModalOpen && (
          <div ref={messageModalRef}>
            <MessageModal
              isOpen={isMessageModalOpen}
              onClose={onCloseMessageModal}
              recipientId={isTaskPoster ? providerDetails?.id : task.user_id}
              taskId={task.id}
              taskTitle={task.title}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailView;
