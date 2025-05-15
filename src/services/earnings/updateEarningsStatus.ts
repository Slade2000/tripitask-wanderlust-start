import { supabase } from "@/integrations/supabase/client";
import { ProviderEarning } from "./types";

/**
 * Updates the status of provider earnings
 * 
 * @param earningId The ID of the earning to update
 * @param newStatus The new status for the earning
 * @returns The updated earning record or null if it failed
 */
export async function updateEarningsStatus(
  earningId: string, 
  newStatus: 'pending' | 'available' | 'withdrawn'
): Promise<ProviderEarning | null> {
  try {
    console.log(`Updating earnings status: ${earningId} to ${newStatus}`);
    
    // First, get the current earning details
    const { data: earningData, error: fetchError } = await supabase
      .from('provider_earnings')
      .select('*')
      .eq('id', earningId)
      .single();
    
    if (fetchError || !earningData) {
      console.error("Error fetching earning data:", fetchError);
      return null;
    }
    
    // Don't update if status is already the same
    if (earningData.status === newStatus) {
      return earningData as unknown as ProviderEarning;
    }
    
    // Update the earning status
    const { data: updatedEarning, error: updateError } = await supabase
      .from('provider_earnings')
      .update({ 
        status: newStatus,
        // If being marked as available, set available_at to now
        ...(newStatus === 'available' ? { available_at: new Date().toISOString() } : {}),
        // If being withdrawn, set withdrawn_at to now
        ...(newStatus === 'withdrawn' ? { withdrawn_at: new Date().toISOString() } : {})
      })
      .eq('id', earningId)
      .select()
      .single();
    
    if (updateError) {
      console.error("Error updating earning status:", updateError);
      return null;
    }
    
    return updatedEarning as unknown as ProviderEarning;
  } catch (error) {
    console.error("Unexpected error in updateEarningsStatus:", error);
    return null;
  }
}

/**
 * Checks for and updates any earnings that are past their available_at date
 * This would typically be run by a cron job
 */
export async function processAvailableEarnings(): Promise<number> {
  try {
    // Find earnings that should now be available
    const now = new Date().toISOString();
    const { data: earningsToUpdate, error: fetchError } = await supabase
      .from('provider_earnings')
      .select('id, provider_id')
      .eq('status', 'pending')
      .lt('available_at', now);
    
    if (fetchError) {
      console.error("Error fetching earnings to update:", fetchError);
      return 0;
    }
    
    if (!earningsToUpdate || earningsToUpdate.length === 0) {
      return 0;
    }
    
    // Update each earning to available status
    let updatedCount = 0;
    for (const earning of earningsToUpdate) {
      const updated = await updateEarningsStatus(earning.id, 'available');
      if (updated) updatedCount++;
    }
    
    return updatedCount;
  } catch (error) {
    console.error("Error processing available earnings:", error);
    return 0;
  }
}
