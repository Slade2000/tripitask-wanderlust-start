
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TaskActionButtons from "./TaskActionButtons";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTaskById } from "@/services/task/queries/getTaskById";

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
  const navigate = useNavigate();
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);

  const handleCompleteTask = async () => {
    if (!task.id || !isTaskPoster) return;
    
    setIsSubmittingCompletion(true);
    try {
      // Update task status to completed
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', task.id)
        .eq('user_id', task.user_id); // Ensure the user is the task poster
        
      if (error) {
        throw error;
      }
      
      toast.success("Task marked as completed!");
      
      // Refresh task data
      const updatedTask = await getTaskById(task.id);
      if (updatedTask) {
        onTaskUpdated(updatedTask);
      }
    } catch (err) {
      console.error("Error completing task:", err);
      toast.error("Error marking task as completed");
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  // For simplicity and to avoid duplication, use the TaskActionButtons component
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <TaskActionButtons
        taskId={task.id}
        isProviderPage={!isTaskPoster}
        taskStatus={task.status}
        isTaskPoster={isTaskPoster}
        onMessageClick={onOpenMessageModal}
        onCompleteTask={handleCompleteTask}
        hasAcceptedOffer={hasAcceptedOffer}
      />
    </div>
  );
}
