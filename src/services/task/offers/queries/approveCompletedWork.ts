
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
    toast.error("Missing required information to approve completion");
    return null;
  }
  
  try {
    // First, update the offer status to 'completed'
    const { error: offerError } = await supabase
      .from('offers')
      .update({ 
        status: 'completed'
      })
      .eq('id', offerId);
      
    if (offerError) {
      console.error("Error updating offer status:", offerError);
      toast.error("Error approving work completion");
      return null;
    }
    
    // Then update the task status to completed
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);
      
    if (taskError) {
      console.error("Error completing task:", taskError);
      toast.error("Error marking task as completed");
      return null;
    }
    
    toast.success("Work completion approved! Task marked as completed.");
    
    // Refresh task data
    const updatedTask = await getTaskById(taskId);
    return updatedTask;
  } catch (err) {
    console.error("Error approving work completion:", err);
    toast.error("Error approving work completion");
    return null;
  }
}
