
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTaskById } from "../../queries/getTaskById";
import { updateTaskStatusForProvider } from "./updateTaskStatusForProvider";

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
    console.log(`Marking work as complete for task: ${taskId} by provider: ${providerId}`);

    // Find the provider's offer for this task
    const { data: offerData, error: offerError } = await supabase
      .from('offers')
      .select('id, status')
      .eq('task_id', taskId)
      .eq('provider_id', providerId)
      .single();
      
    if (offerError || !offerData) {
      console.error(`Error finding provider's offer:`, offerError);
      toast.error("Could not verify your offer for this task");
      return null;
    }
    
    console.log(`Found provider offer:`, offerData);
    
    // Update offer status to work_completed (pending approval)
    const { error: updateOfferError } = await supabase
      .from('offers')
      .update({ 
        status: 'work_completed'
      })
      .eq('id', offerData.id);
      
    if (updateOfferError) {
      console.error(`Error updating offer status:`, updateOfferError);
      toast.error("Error marking your work as completed");
      return null;
    }
    
    console.log(`Successfully updated offer status to 'work_completed'`);

    // Now use the secure function to update task status to 'pending_complete'
    const updateResult = await updateTaskStatusForProvider(taskId, providerId);
    
    if (!updateResult.success) {
      console.error(`Failed to update task status:`, updateResult.error);
      toast.error(`Failed to update task status: ${updateResult.error}`);
      return null;
    }
    
    console.log(`Task status successfully updated to 'pending_complete'`);
    toast.success("You've marked your work as completed! Awaiting customer approval.");
    
    // Refresh task data
    const updatedTask = await getTaskById(taskId);
    console.log("Updated task:", updatedTask);
    return updatedTask;
  } catch (err) {
    console.error(`Error in completeWorkDone:`, err);
    toast.error("Error marking work as completed");
    return null;
  }
}
