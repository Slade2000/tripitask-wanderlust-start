
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
    
    // Get the provider's current profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('pending_earnings, available_balance')
      .eq('id', earningData.provider_id)
      .single();
    
    if (profileError) {
      console.error("Error fetching profile data:", profileError);
      return updatedEarning as unknown as ProviderEarning;
    }
    
    // If moving from pending to available, update the profile balance
    if (earningData.status === 'pending' && newStatus === 'available') {
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          pending_earnings: (profileData.pending_earnings || 0) - earningData.net_amount,
          available_balance: (profileData.available_balance || 0) + earningData.net_amount
        })
        .eq('id', earningData.provider_id);
      
      if (profileUpdateError) {
        console.error("Error updating profile balances:", profileUpdateError);
      } else {
        console.log("Updated profile balances: moved amount from pending to available");
      }
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
      .select('id')
      .eq('status', 'pending')
      .lt('available_at', now);
    
    if (fetchError) {
      console.error("Error fetching earnings to update:", fetchError);
      return 0;
    }
    
    if (!earningsToUpdate || earningsToUpdate.length === 0) {
      return 0;
    }
    
    // Update each earning
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
