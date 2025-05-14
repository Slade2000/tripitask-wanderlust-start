
import { useState } from "react";
import { completeWorkDone } from "@/services/task/offers/queries/completeWorkDone";
import { toast } from "sonner";

/**
 * Hook to handle service provider work completion functionality
 */
export function useTaskProviderCompletion(taskId: string, providerId: string, onTaskUpdated: (task: any) => void) {
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);
  
  /**
   * Handles marking the service provider's work as complete
   */
  const handleCompleteWork = async () => {
    if (!taskId || !providerId) {
      toast.error("Missing task or provider information");
      return;
    }
    
    setIsSubmittingCompletion(true);
    try {
      const updatedTask = await completeWorkDone(taskId, providerId);
      
      if (updatedTask) {
        onTaskUpdated(updatedTask);
        toast.success("Work marked as complete. Awaiting customer approval.");
      } else {
        toast.error("Failed to mark work as complete. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleCompleteWork:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmittingCompletion(false);
    }
  };
  
  return {
    isSubmittingCompletion,
    handleCompleteWork
  };
}
