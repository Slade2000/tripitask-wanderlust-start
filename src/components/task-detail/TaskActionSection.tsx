
import TaskActionButtons from "./TaskActionButtons";
import { useTaskCompletion } from "@/hooks/useTaskCompletion";

interface TaskActionSectionProps {
  task: any;
  isTaskPoster: boolean;
  onOpenMessageModal: () => void;
  onTaskUpdated: (updatedTask: any) => void;
  hasAcceptedOffer?: boolean;
}

export default function TaskActionSection({ 
  task, 
  isTaskPoster, 
  onOpenMessageModal, 
  onTaskUpdated,
  hasAcceptedOffer = false
}: TaskActionSectionProps) {
  const { isSubmittingCompletion, handleCompleteTask } = useTaskCompletion(
    task.id,
    task.user_id,
    onTaskUpdated
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <TaskActionButtons
        taskId={task.id}
        isProviderPage={!isTaskPoster}
        taskStatus={task.status}
        isTaskPoster={isTaskPoster}
        onMessageClick={onOpenMessageModal}
        onCompleteTask={handleCompleteTask}
        isSubmittingCompletion={isSubmittingCompletion}
        hasAcceptedOffer={hasAcceptedOffer}
      />
    </div>
  );
}
