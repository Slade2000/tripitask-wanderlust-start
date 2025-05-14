
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTaskById } from "../../queries/getTaskById";

/**
 * Marks a task as completed after the task poster approves the service provider's work
 * @param taskId The ID of the task to approve
 * @param offerId The ID of the offer that was completed
 * @returns The updated task data or null if the operation failed
 */
export async function approveCompletedWork(taskId: string, offerId: string) {
  if (!taskId || !offerId) {
    toast.error("Invalid task or offer information. Unable to proceed.");
    console.error("Missing required parameters:", { taskId, offerId });
    return null;
  }
  
  try {
    console.log("Starting approval process for task:", taskId, "offer:", offerId);
    
    // First verify the offer belongs to this task and has the correct status
    const { data: offerData, error: offerCheckError } = await supabase
      .from('offers')
      .select('id, status, provider_id')
      .eq('id', offerId)
      .eq('task_id', taskId)
      .single();
      
    if (offerCheckError || !offerData) {
      console.error(`Error verifying offer ${offerId} for task ${taskId}:`, offerCheckError);
      toast.error("Could not verify the completed work offer");
      return null;
    }
    
    console.log("Found offer with status:", offerData.status);
    
    // Accept both 'work_completed' and 'accepted' statuses for backward compatibility
    if (offerData.status !== 'work_completed' && offerData.status !== 'accepted') {
      console.error(`Cannot approve offer ${offerId} with status ${offerData.status}`);
      toast.error("This offer is not marked as completed by the provider");
      return null;
    }
    
    // First, update the offer status to 'completed'
    const { error: offerError } = await supabase
      .from('offers')
      .update({ 
        status: 'completed'
      })
      .eq('id', offerId);
      
    if (offerError) {
      console.error(`Error updating offer ${offerId} status:`, offerError);
      toast.error("Error approving work completion");
      return null;
    }
    
    console.log("Offer status updated to completed, now updating task");
    
    // Then update the task status to completed
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);
      
    if (taskError) {
      console.error(`Error updating task ${taskId} status:`, taskError);
      toast.error("Failed to mark task as completed");
      return null;
    }
    
    console.log("Task updated to completed status");
    toast.success("Work completion approved! Task marked as completed.");
    
    // Refresh task data
    const updatedTask = await getTaskById(taskId);
    return updatedTask;
  } catch (err) {
    console.error(`Error in approveCompletedWork for task ${taskId}, offer ${offerId}:`, err);
    toast.error("Error approving work completion");
    return null;
  }
}
