
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
    toast.error("Missing required information to complete task");
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
      console.error("Error finding provider's offer:", offerError);
      toast.error("Could not verify your offer for this task");
      return null;
    }
    
    // Update offer status to work_completed (pending approval)
    const { error: updateError } = await supabase
      .from('offers')
      .update({ 
        status: 'work_completed'
      })
      .eq('id', offerData.id);
      
    if (updateError) {
      console.error("Error marking work as completed:", updateError);
      toast.error("Error marking your work as completed");
      return null;
    }
    
    toast.success("You've marked your work as completed! Awaiting customer approval.");
    
    // Refresh task data
    const updatedTask = await getTaskById(taskId);
    return updatedTask;
  } catch (err) {
    console.error("Error marking work as completed:", err);
    toast.error("Error marking work as completed");
    return null;
  }
}
