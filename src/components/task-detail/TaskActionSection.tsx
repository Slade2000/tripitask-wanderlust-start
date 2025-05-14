
import TaskActionButtons from "./TaskActionButtons";
import { useTaskCompletion } from "@/hooks/useTaskCompletion";
import { useTaskProviderCompletion } from "@/hooks/useTaskProviderCompletion";
import { useTaskCompletionApproval } from "@/hooks/useTaskCompletionApproval";
import { useAuth } from "@/contexts/auth";
import { Offer } from "@/types/offer";

interface TaskActionSectionProps {
  task: any;
  offers: Offer[];
  isTaskPoster: boolean;
  onOpenMessageModal: () => void;
  onTaskUpdated: (updatedTask: any) => void;
  hasAcceptedOffer?: boolean;
  isCurrentUserProvider?: boolean;
}

export default function TaskActionSection({
  task,
  offers,
  isTaskPoster,
  onOpenMessageModal,
  onTaskUpdated,
  hasAcceptedOffer = false,
  isCurrentUserProvider = false
}: TaskActionSectionProps) {
  const { user } = useAuth();
  
  // For task poster completion
  const {
    isSubmittingCompletion,
    handleCompleteTask
  } = useTaskCompletion(task.id, task.user_id, onTaskUpdated);
  
  // For service provider completion
  const {
    isSubmittingCompletion: isSubmittingProviderCompletion,
    handleCompleteWork
  } = useTaskProviderCompletion(
    task.id, 
    user?.id || '', 
    onTaskUpdated
  );

  // For task poster approval of completion
  const {
    isApprovingCompletion,
    handleApproveCompletion
  } = useTaskCompletionApproval(task.id, onTaskUpdated);
  
  // Find if there's a pending completion offer
  const pendingCompletionOffer = offers.find(offer => 
    offer.status === 'work_completed'
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-medium mb-3">Task Actions</h3>
      
      {isTaskPoster && task.status === 'pending_complete' && pendingCompletionOffer && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
          <p className="text-yellow-800">
            <strong>Action Required:</strong> The service provider has marked this task as complete. 
            Please review their work and approve the completion if satisfactory.
          </p>
        </div>
      )}

      <TaskActionButtons
        taskId={task.id}
        isProviderPage={!isTaskPoster}
        taskStatus={task.status}
        isTaskPoster={isTaskPoster}
        isCurrentUserProvider={isCurrentUserProvider}
        onMessageClick={onOpenMessageModal}
        onCompleteTask={handleCompleteTask}
        onProviderCompleteTask={handleCompleteWork}
        onApproveCompletion={handleApproveCompletion}
        isSubmittingCompletion={isSubmittingCompletion}
        isSubmittingProviderCompletion={isSubmittingProviderCompletion}
        isApprovingCompletion={isApprovingCompletion}
        hasAcceptedOffer={hasAcceptedOffer}
        pendingCompletionOfferId={pendingCompletionOffer?.id}
      />
    </div>
  );
}
