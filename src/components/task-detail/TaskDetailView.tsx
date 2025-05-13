
import { Button } from "@/components/ui/button";
import TaskBasicInfo from "@/components/task-detail/TaskBasicInfo";
import TaskDescription from "@/components/task-detail/TaskDescription";
import TaskImageGallery from "@/components/task-detail/TaskImageGallery";
import TaskPosterInfo from "@/components/task-detail/TaskPosterInfo";
import MessageModal from "@/components/messages/MessageModal";
import TaskDetailHeader from "@/components/task-detail/TaskDetailHeader";
import TaskActionSection from "@/components/task-detail/TaskActionSection";
import TaskOffersSection from "@/components/task-detail/TaskOffersSection";
import TaskInterestSection from "./TaskInterestSection";

interface TaskDetailViewProps {
  task: any;
  offers: any[];
  isTaskPoster: boolean;
  hasAcceptedOffer: boolean;
  isMessageModalOpen: boolean;
  onOpenMessageModal: () => void;
  onCloseMessageModal: () => void;
  onTaskUpdated: (updatedTask: any) => void;
  onRefreshOffers: () => Promise<void>;
}

export default function TaskDetailView({ 
  task, 
  offers, 
  isTaskPoster, 
  hasAcceptedOffer,
  isMessageModalOpen,
  onOpenMessageModal,
  onCloseMessageModal,
  onTaskUpdated,
  onRefreshOffers
}: TaskDetailViewProps) {
  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="max-w-4xl mx-auto">
        <TaskDetailHeader title={task.title} status={task.status} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {task.task_photos && task.task_photos.length > 0 && (
              <TaskImageGallery photos={task.task_photos.map((p: any) => p.photo_url)} />
            )}
            
            <TaskBasicInfo
              budget={task.budget}
              location={task.location}
              dueDate={task.due_date}
              categoryName={task.categories?.name}
            />
            
            <TaskDescription description={task.description} />
            
            {/* Interest section for non-task-posters */}
            <TaskInterestSection 
              taskId={task.id}
              isTaskPoster={isTaskPoster}
              hasAcceptedOffer={hasAcceptedOffer}
              status={task.status}
              onOpenMessageModal={onOpenMessageModal}
            />
            
            <TaskOffersSection 
              taskId={task.id || ''}
              isTaskPoster={isTaskPoster}
              offers={offers}
              onRefreshOffers={onRefreshOffers}
            />
          </div>
          
          <div className="space-y-6">
            <TaskPosterInfo
              userId={task.user_id}
              taskId={task.id}
            />
            
            <TaskActionSection 
              task={task}
              isTaskPoster={isTaskPoster} 
              onOpenMessageModal={onOpenMessageModal}
              onTaskUpdated={onTaskUpdated}
              hasAcceptedOffer={hasAcceptedOffer}
            />
          </div>
        </div>
      </div>
      
      {isMessageModalOpen && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={onCloseMessageModal}
          taskId={task.id}
          receiverId={task.user_id}
          taskTitle={task.title}
        />
      )}
    </div>
  );
}
