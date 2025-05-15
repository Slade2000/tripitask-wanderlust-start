
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProviderEarning } from "./types";

/**
 * Updates the status of an earnings record
 * 
 * @param earningId The ID of the earnings record
 * @param newStatus The new status
 * @returns The updated earnings record or null if it failed
 */
export async function updateEarningsStatus(
  earningId: string,
  newStatus: 'pending' | 'available' | 'withdrawn'
): Promise<ProviderEarning | null> {
  try {
    // First get the current earnings record
    const { data: currentEarning, error: fetchError } = await supabase
      .from('provider_earnings')
      .select('*')
      .eq('id', earningId)
      .single();
    
    if (fetchError || !currentEarning) {
      console.error("Could not fetch earnings record:", fetchError);
      toast.error("Failed to update earnings status: record not found");
      return null;
    }
    
    const updates: Record<string, any> = {
      status: newStatus
    };
    
    // Add appropriate timestamps based on status change
    if (newStatus === 'available' && !currentEarning.available_at) {
      updates.available_at = new Date().toISOString();
    } else if (newStatus === 'withdrawn' && !currentEarning.withdrawn_at) {
      updates.withdrawn_at = new Date().toISOString();
    }
    
    // Update the earnings record
    const { data: updatedEarning, error: updateError } = await supabase
      .from('provider_earnings')
      .update(updates)
      .eq('id', earningId)
      .select()
      .single();
    
    if (updateError) {
      console.error("Error updating earnings status:", updateError);
      toast.error("Failed to update earnings status");
      return null;
    }
    
    // If this is moving from pending to available, update the provider's balances
    if (currentEarning.status === 'pending' && newStatus === 'available') {
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          pending_earnings: supabase.rpc('decrement', { dec: currentEarning.net_amount }),
          available_balance: supabase.rpc('increment', { inc: currentEarning.net_amount })
        })
        .eq('id', currentEarning.provider_id);
      
      if (profileUpdateError) {
        console.error("Error updating provider balances:", profileUpdateError);
        toast.error("Provider balances could not be updated");
      }
    }
    
    return updatedEarning;
  } catch (error) {
    console.error("Unexpected error in updateEarningsStatus:", error);
    toast.error("Failed to update earnings status due to an unexpected error");
    return null;
  }
}
