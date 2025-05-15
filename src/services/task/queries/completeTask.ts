
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTaskById } from "./getTaskById";
import { recordEarnings } from "@/services/earnings/recordEarnings";

/**
 * Updates a task's status to completed
 * @param taskId The ID of the task to complete
 * @param userId The ID of the task poster (for validation)
 * @returns The updated task data or null if the operation failed
 */
export async function completeTask(taskId: string, userId: string) {
  if (!taskId || !userId) {
    toast.error("Missing required information to complete task");
    return null;
  }
  
  try {
    // First, find the accepted offer for this task to update its status
    const { data: acceptedOffer, error: offerError } = await supabase
      .from('offers')
      .select('id, provider_id')
      .eq('task_id', taskId)
      .eq('status', 'accepted')
      .single();
      
    if (offerError && offerError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error finding accepted offer:", offerError);
      // Continue anyway, as there might not be an offer
    }
    
    // Update task status to completed
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', userId); // Ensure the user is the task poster
      
    if (error) {
      console.error("Error completing task:", error);
      toast.error("Error marking task as completed");
      return null;
    }
    
    // If there's an accepted offer, update its status and record earnings
    if (acceptedOffer) {
      // Update the offer status to completed
      const { error: updateOfferError } = await supabase
        .from('offers')
        .update({ status: 'completed' })
        .eq('id', acceptedOffer.id);
        
      if (updateOfferError) {
        console.error("Error updating offer status:", updateOfferError);
        toast.error("Task marked as completed, but offer status update failed");
      } else {
        // Record earnings for the provider
        const earningsResult = await recordEarnings(taskId, acceptedOffer.id);
        
        if (!earningsResult) {
          console.error("Failed to record earnings for provider:", acceptedOffer.provider_id);
          toast.error("Task completed, but provider earnings recording failed");
        } else {
          console.log("Provider earnings recorded successfully:", earningsResult);
        }
      }
    } else {
      console.log("No accepted offer found for this task, skipping offer update and earnings recording");
    }
    
    toast.success("Task marked as completed!");
    
    // Refresh task data
    const updatedTask = await getTaskById(taskId);
    return updatedTask;
  } catch (err) {
    console.error("Error completing task:", err);
    toast.error("Error marking task as completed");
    return null;
  }
}
