
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates the status of an offer (accept or reject)
 * When an offer is accepted, also updates the task status to 'assigned'
 */
export async function updateOfferStatus(
  offerId: string, 
  status: 'accepted' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  try {
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

    // Update the offer status
    const { error: updateOfferError } = await supabase
      .from('offers')
      .update({ status })
      .eq('id', offerId);

    if (updateOfferError) {
      console.error("Error updating offer status:", updateOfferError);
      return { success: false, error: updateOfferError.message };
    }

    // If the offer is accepted, update the task status to 'assigned'
    if (status === 'accepted') {
      const { error: updateTaskError } = await supabase
        .from('tasks')
        .update({ status: 'assigned' })
        .eq('id', taskId);

      if (updateTaskError) {
        console.error("Error updating task status:", updateTaskError);
        return { success: false, error: updateTaskError.message };
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating offer status:", error);
    return { success: false, error: error.message };
  }
}
