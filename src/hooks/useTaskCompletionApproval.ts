
import { useState } from "react";
import { approveCompletedWork } from "@/services/taskService";
import { toast } from "sonner";

/**
 * Hook to handle task completion approval by the task poster
 */
export function useTaskCompletionApproval(taskId: string, onTaskUpdated: (updatedTask: any) => void) {
  const [isApprovingCompletion, setIsApprovingCompletion] = useState(false);

  const handleApproveCompletion = async (offerId: string) => {
    if (!taskId || !offerId) {
      toast.error("Missing task or offer information");
      return;
    }
    
    setIsApprovingCompletion(true);
    try {
      const updatedTask = await approveCompletedWork(taskId, offerId);
      
      if (updatedTask) {
        toast.success("Work completion approved! Task has been marked as completed.");
        if (onTaskUpdated) {
          onTaskUpdated(updatedTask);
        }
      } else {
        toast.error("Failed to approve work completion. Please try again.");
      }
    } catch (error) {
      console.error("Error approving work completion:", error);
      toast.error("An unexpected error occurred while approving completion");
    } finally {
      setIsApprovingCompletion(false);
    }
  };

  return {
    isApprovingCompletion,
    handleApproveCompletion
  };
}
