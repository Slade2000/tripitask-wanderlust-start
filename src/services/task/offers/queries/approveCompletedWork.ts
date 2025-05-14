
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTaskById } from "../../queries/getTaskById";

/**
 * Approves a completed task by the task owner/poster
 * @param taskId The ID of the task to approve as completed
 * @param offerId The ID of the offer to approve
 * @returns The updated task data or null if the operation failed
 */
export async function approveCompletedWork(taskId: string, offerId: string) {
  if (!taskId || !offerId) {
    toast.error("Missing required information to approve task completion");
    return null;
  }
  
  try {
    // First verify the offer belongs to this task and is in work_completed status
    const { data: offerData, error: offerError } = await supabase
      .from('offers')
      .select('id, status')
      .eq('task_id', taskId)
      .eq('id', offerId)
      .eq('status', 'work_completed')
      .single();
      
    if (offerError || !offerData) {
      console.error("Error finding offer to approve:", offerError);
      toast.error("Could not find a completed offer to approve");
      return null;
    }
    
    // Update offer status to completion_approved
    const { error: updateOfferError } = await supabase
      .from('offers')
      .update({ 
        status: 'completion_approved' 
      })
      .eq('id', offerId);
      
    if (updateOfferError) {
      console.error("Error approving completed work:", updateOfferError);
      toast.error("Error approving completed work");
      return null;
    }
    
    // Update task status to completed
    const { error: updateTaskError } = await supabase
      .from('tasks')
      .update({ 
        status: 'completed' 
      })
      .eq('id', taskId);
      
    if (updateTaskError) {
      console.error("Error updating task status to completed:", updateTaskError);
      toast.error("Error updating task status");
      return null;
    }
    
    toast.success("Task completion has been approved!");
    
    // Refresh task data
    const updatedTask = await getTaskById(taskId);
    return updatedTask;
  } catch (err) {
    console.error("Error approving completed work:", err);
    toast.error("Error approving task completion");
    return null;
  }
}
