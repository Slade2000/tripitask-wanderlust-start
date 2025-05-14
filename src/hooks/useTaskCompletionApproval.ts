
import { useState } from "react";
import { approveCompletedWork } from "@/services/task/offers/queries/approveCompletedWork";

/**
 * Hook to handle task poster's approval of completed work
 */
export function useTaskCompletionApproval(taskId: string, onTaskUpdated: (task: any) => void) {
  const [isApprovingCompletion, setIsApprovingCompletion] = useState(false);
  
  /**
   * Handles approving a completed task by the service provider
   */
  const handleApproveCompletion = async (offerId: string) => {
    if (!taskId || !offerId) return;
    
    setIsApprovingCompletion(true);
    try {
      const updatedTask = await approveCompletedWork(taskId, offerId);
      
      if (updatedTask) {
        onTaskUpdated(updatedTask);
      }
    } catch (error) {
      console.error("Error in handleApproveCompletion:", error);
    } finally {
      setIsApprovingCompletion(false);
    }
  };
  
  return {
    isApprovingCompletion,
    handleApproveCompletion
  };
}
