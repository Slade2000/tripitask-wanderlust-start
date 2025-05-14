
import { useState } from "react";
import { completeWorkDone } from "@/services/task/offers/queries/completeWorkDone";

/**
 * Hook to handle service provider work completion functionality
 */
export function useTaskProviderCompletion(taskId: string, providerId: string, onTaskUpdated: (task: any) => void) {
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);
  
  /**
   * Handles marking the service provider's work as complete
   */
  const handleCompleteWork = async () => {
    if (!taskId || !providerId) return;
    
    setIsSubmittingCompletion(true);
    try {
      const updatedTask = await completeWorkDone(taskId, providerId);
      
      if (updatedTask) {
        onTaskUpdated(updatedTask);
      }
    } finally {
      setIsSubmittingCompletion(false);
    }
  };
  
  return {
    isSubmittingCompletion,
    handleCompleteWork
  };
}
