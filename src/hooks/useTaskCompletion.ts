
import { useState } from "react";
import { completeTask } from "@/services/task/queries/completeTask";

/**
 * Hook to handle task completion functionality
 */
export function useTaskCompletion(taskId: string, userId: string, onTaskUpdated: (task: any) => void) {
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);
  
  /**
   * Handles the task completion process
   */
  const handleCompleteTask = async () => {
    if (!taskId || !userId) return;
    
    setIsSubmittingCompletion(true);
    try {
      const updatedTask = await completeTask(taskId, userId);
      
      if (updatedTask) {
        onTaskUpdated(updatedTask);
      }
    } finally {
      setIsSubmittingCompletion(false);
    }
  };
  
  return {
    isSubmittingCompletion,
    handleCompleteTask
  };
}
