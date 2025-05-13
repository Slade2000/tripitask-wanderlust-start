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
  const {
    isSubmittingCompletion,
    handleCompleteTask
  } = useTaskCompletion(task.id, task.user_id, onTaskUpdated);
  return;
}