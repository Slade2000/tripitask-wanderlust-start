
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Updates the status of an offer (accept or reject)
 * When an offer is accepted, also updates the task status to 'assigned'
 */
export async function updateOfferStatus(
  offerId: string, 
  status: 'accepted' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Updating offer ${offerId} to status: ${status}`);
    
    // Start a transaction by getting the task_id first
    const { data: offerData, error: offerError } = await supabase
      .from('offers')
      .select('task_id')
      .eq('id', offerId)
      .single();

    if (offerError) {
      console.error("Error fetching offer data:", offerError);
      return { success: false, error: offerError.message };
    }

    const taskId = offerData.task_id;
    console.log(`Found associated task ID for status update: ${taskId}`);

    // Update the offer status
    const { error: updateOfferError } = await supabase
      .from('offers')
      .update({ status })
      .eq('id', offerId);

    if (updateOfferError) {
      console.error("Error updating offer status:", updateOfferError);
      return { success: false, error: updateOfferError.message };
    }

    console.log(`Successfully updated offer status to: ${status}`);

    // If the offer is accepted, update the task status to 'in_progress' (with underscore)
    if (status === 'accepted') {
      console.log(`Attempting to update task ${taskId} status to 'in_progress'`);
      
      const { data: taskData, error: taskCheckError } = await supabase
        .from('tasks')
        .select('status')
        .eq('id', taskId)
        .single();
        
      if (taskCheckError) {
        console.error("Error checking task status:", taskCheckError);
        return { success: false, error: taskCheckError.message };
      }
      
      console.log(`Current task status before update: ${taskData.status}`);
      
      const { error: updateTaskError } = await supabase
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', taskId);

      if (updateTaskError) {
        console.error("Error updating task status:", updateTaskError);
        return { success: false, error: updateTaskError.message };
      }
      
      console.log(`Successfully updated task ${taskId} status to 'in_progress'`);
      
      // Verify the task was updated correctly
      const { data: verifyData, error: verifyError } = await supabase
        .from('tasks')
        .select('status')
        .eq('id', taskId)
        .single();
        
      if (verifyError) {
        console.warn("Could not verify task status update:", verifyError);
      } else if (verifyData?.status !== 'in_progress') {
        console.warn("Task status verification failed. Current status:", verifyData?.status);
        return { success: false, error: "Task status verification failed" };
      } else {
        console.log(`Verified task status after update: ${verifyData.status}`);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating offer status:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Data consistency check to synchronize task status with offer status
 * This can be used to fix tasks with accepted offers but incorrect status
 */
export async function syncTaskStatusWithOffers(taskId: string): Promise<{ success: boolean; error?: string; updated?: boolean }> {
  try {
    console.log(`Checking data consistency for task ${taskId}`);
    
    // Check if task has any accepted offers
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('status')
      .eq('task_id', taskId)
      .eq('status', 'accepted');
      
    if (offersError) {
      console.error("Error checking offers for task:", offersError);
      return { success: false, error: offersError.message };
    }
    
    // Get current task status
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('status')
      .eq('id', taskId)
      .single();
      
    if (taskError) {
      console.error("Error fetching task status:", taskError);
      return { success: false, error: taskError.message };
    }
    
    // If there are accepted offers but task is not in_progress/completed/pending_complete
    const hasAcceptedOffer = offers && offers.length > 0;
    const needsUpdate = hasAcceptedOffer && 
                        taskData.status !== 'in_progress' && 
                        taskData.status !== 'completed' && 
                        taskData.status !== 'pending_complete';
    
    if (needsUpdate) {
      console.log(`Data inconsistency found: Task ${taskId} has accepted offers but status is '${taskData.status}'`);
      
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', taskId);
        
      if (updateError) {
        console.error("Error fixing task status:", updateError);
        return { success: false, error: updateError.message };
      }
      
      console.log(`Fixed task ${taskId} status to 'in_progress'`);
      return { success: true, updated: true };
    }
    
    return { success: true, updated: false };
  } catch (error: any) {
    console.error("Error in syncTaskStatusWithOffers:", error);
    return { success: false, error: error.message };
  }
}
