
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTaskById } from "../../queries/getTaskById";

/**
 * Marks a service provider's work as complete on a task, but pending approval
 * @param taskId The ID of the task to mark as work completed
 * @param providerId The ID of the service provider
 * @returns The updated task data or null if the operation failed
 */
export async function completeWorkDone(taskId: string, providerId: string) {
  if (!taskId || !providerId) {
    toast.error("Invalid task or provider information. Unable to proceed.");
    console.error("Missing required parameters:", { taskId, providerId });
    return null;
  }
  
  try {
    // Find the provider's offer for this task
    const { data: offerData, error: offerError } = await supabase
      .from('offers')
      .select('id, status')
      .eq('task_id', taskId)
      .eq('provider_id', providerId)
      .single();
      
    if (offerError || !offerData) {
      console.error(`Error finding provider's offer for task ${taskId}, provider ${providerId}:`, offerError);
      toast.error("Could not verify your offer for this task");
      return null;
    }
    
    // Update offer status to work_completed (pending approval)
    const { error: updateOfferError } = await supabase
      .from('offers')
      .update({ 
        status: 'work_completed'
      })
      .eq('id', offerData.id);
      
    if (updateOfferError) {
      console.error(`Error marking work as completed for offer ${offerData.id}:`, updateOfferError);
      toast.error("Error marking your work as completed");
      return null;
    }

    // Update task status to pending_complete with retry logic
    let updateTaskError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'pending_complete'
        })
        .eq('id', taskId);
      
      updateTaskError = error;
      
      if (!error) {
        break; // Success, exit retry loop
      } else {
        console.warn(`Task status update attempt ${attempt + 1} failed:`, error);
        // Small delay before retry
        if (attempt < 2) await new Promise(r => setTimeout(r, 500));
      }
    }
    
    if (updateTaskError) {
      console.error(`Task status update failed after 3 attempts for task ${taskId}:`, updateTaskError);
      toast.error(`Failed to update task status. Please try again.`);
      return null;
    }
    
    toast.success("You've marked your work as completed! Awaiting customer approval.");
    
    // Refresh task data
    const updatedTask = await getTaskById(taskId);
    return updatedTask;
  } catch (err) {
    console.error(`Error in completeWorkDone for task ${taskId}, provider ${providerId}:`, err);
    toast.error("Error marking work as completed");
    return null;
  }
}
