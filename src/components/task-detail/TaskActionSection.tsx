
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
}

export default function TaskActionSection({ 
  task, 
  isTaskPoster, 
  onOpenMessageModal, 
  onTaskUpdated 
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

  // If user is task poster and task is in progress, show complete button
  if (isTaskPoster && task.status === "in_progress") {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex space-x-2">
          <Button
            onClick={handleCompleteTask}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isSubmittingCompletion}
          >
            {isSubmittingCompletion ? "Processing..." : "Complete Task"}
          </Button>
          <Button
            onClick={onOpenMessageModal}
            variant="outline"
            className="border-teal text-teal hover:bg-teal/10"
          >
            Messages
          </Button>
        </div>
      </div>
    );
  }

  // If provider view and task is open, show submit offer button
  if (!isTaskPoster && task.status === "open") {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate(`/tasks/${task.id}/submit-offer`)}
            className="bg-teal hover:bg-teal-dark"
          >
            Submit an Offer
          </Button>
          <Button
            onClick={onOpenMessageModal}
            variant="outline"
            className="border-teal text-teal hover:bg-teal/10"
          >
            Ask a Question
          </Button>
        </div>
      </div>
    );
  }

  // For closed tasks or any other scenarios
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <TaskActionButtons
        taskId={task.id}
        isProviderPage={!isTaskPoster}
        taskStatus={task.status}
        isTaskPoster={isTaskPoster}
        onMessageClick={onOpenMessageModal}
        onCompleteTask={handleCompleteTask}
      />
    </div>
  );
}
