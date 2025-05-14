
import { useState } from "react";
import { completeWorkDone } from "@/services/task/offers/queries/completeWorkDone";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

/**
 * Hook to handle service provider work completion functionality
 */
export function useTaskProviderCompletion(taskId: string, providerId: string, onTaskUpdated: (task: any) => void) {
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);
  const { user } = useAuth();
  
  /**
   * Handles marking the service provider's work as complete
   */
  const handleCompleteWork = async () => {
    if (!taskId || !providerId) {
      toast.error("Missing task or provider information");
      console.error("Missing required parameters for completion:", { taskId, providerId });
      return;
    }
    
    if (!user) {
      console.error("User not authenticated when trying to complete work");
      toast.error("You must be logged in to complete work");
      return;
    }
    
    if (user.id !== providerId) {
      console.error("Authentication mismatch! Logged in user doesn't match provider ID", 
        { userId: user.id, providerId });
      toast.error("Authentication error. Please try logging in again.");
      return;
    }
    
    console.log("Starting work completion process:", { 
      taskId, 
      providerId,
      authenticatedUser: user.id
    });
    
    setIsSubmittingCompletion(true);
    try {
      const updatedTask = await completeWorkDone(taskId, providerId);
      
      if (updatedTask) {
        console.log("Work completed successfully:", updatedTask);
        onTaskUpdated(updatedTask);
        toast.success("Work marked as complete. Awaiting customer approval.");
      } else {
        console.error("Failed to mark work as complete - null response");
        toast.error("Failed to mark work as complete. Please try again.");
      }
    } catch (error) {
      console.error("Exception in handleCompleteWork:", error);
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
