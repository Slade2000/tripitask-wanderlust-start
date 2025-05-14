
import { useState } from "react";
import { approveCompletedWork } from "@/services/task/offers/queries/approveCompletedWork";
import { toast } from "sonner";

/**
 * Hook to handle task completion approval by the task poster
 */
export function useTaskCompletionApproval(taskId: string, onTaskUpdated: (updatedTask: any) => void) {
  const [isApprovingCompletion, setIsApprovingCompletion] = useState(false);

  const handleApproveCompletion = async (offerId: string) => {
    if (!taskId || !offerId) {
      toast.error("Missing task or offer information");
      console.error("Missing IDs for approval:", { taskId, offerId });
      return;
    }
    
    setIsApprovingCompletion(true);
    console.log(`Approving completion for task ${taskId}, offer ${offerId}`);
    
    try {
      const updatedTask = await approveCompletedWork(taskId, offerId);
      
      if (updatedTask) {
        console.log("Successfully approved work completion:", updatedTask);
        toast.success("Work completion approved! Task has been marked as completed.");
        if (onTaskUpdated) {
          onTaskUpdated(updatedTask);
        }
      } else {
        console.error("approveCompletedWork returned null");
        toast.error("Failed to approve work completion. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleApproveCompletion:", error);
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
