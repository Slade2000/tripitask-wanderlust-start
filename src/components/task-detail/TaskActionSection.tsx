
import TaskActionButtons from "./TaskActionButtons";
import { useTaskCompletion } from "@/hooks/useTaskCompletion";
import { useTaskProviderCompletion } from "@/hooks/useTaskProviderCompletion";
import { useAuth } from "@/contexts/auth";

interface TaskActionSectionProps {
  task: any;
  isTaskPoster: boolean;
  onOpenMessageModal: () => void;
  onTaskUpdated: (updatedTask: any) => void;
  hasAcceptedOffer?: boolean;
  isCurrentUserProvider?: boolean;
}

export default function TaskActionSection({
  task,
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
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-medium mb-3">Task Actions</h3>
      <TaskActionButtons
        taskId={task.id}
        isProviderPage={!isTaskPoster}
        taskStatus={task.status}
        isTaskPoster={isTaskPoster}
        isCurrentUserProvider={isCurrentUserProvider}
        onMessageClick={onOpenMessageModal}
        onCompleteTask={handleCompleteTask}
        onProviderCompleteTask={handleCompleteWork}
        isSubmittingCompletion={isSubmittingCompletion}
        isSubmittingProviderCompletion={isSubmittingProviderCompletion}
        hasAcceptedOffer={hasAcceptedOffer}
      />
    </div>
  );
}
