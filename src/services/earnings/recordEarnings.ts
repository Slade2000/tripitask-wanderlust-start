import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProviderEarning } from "./types";

/**
 * Records earnings for a provider when a task is completed
 * 
 * @param taskId The task that was completed
 * @param offerId The offer that was completed
 * @returns The created earnings record or null if it failed
 */
export async function recordEarnings(taskId: string, offerId: string): Promise<ProviderEarning | null> {
  try {
    console.log("Recording earnings for task:", taskId, "offer:", offerId);
    
    // Get the offer details including the provider and amount
    const { data: offerData, error: offerError } = await supabase
      .from('offers')
      .select(`
        id, 
        provider_id,
        amount,
        net_amount
      `)
      .eq('id', offerId)
      .eq('task_id', taskId)
      .single();
      
    if (offerError || !offerData) {
      console.error("Could not fetch offer data:", offerError);
      toast.error("Failed to record earnings: could not retrieve offer details");
      return null;
    }
    
    // Calculate commission - use the net_amount stored in the offer if available, 
    // otherwise calculate based on fixed percentage
    const commissionRate = 0.10; // 10% commission
    const grossAmount = offerData.amount;
    const netAmount = offerData.net_amount || grossAmount * (1 - commissionRate);
    const commissionAmount = grossAmount - netAmount;
    
    // Set the date when earnings will be available (7 days from now, as an example)
    const availableDate = new Date();
    availableDate.setDate(availableDate.getDate() + 7);
    
    // Record the earnings
    const { data: earningsData, error: earningsError } = await supabase
      .from('provider_earnings')
      .insert([{
        provider_id: offerData.provider_id,
        task_id: taskId,
        offer_id: offerId,
        amount: grossAmount,
        commission_amount: commissionAmount,
        net_amount: netAmount,
        status: 'pending',
        available_at: availableDate.toISOString()
      }])
      .select()
      .single();
    
    if (earningsError) {
      console.error("Error recording earnings:", earningsError);
      toast.error("Failed to record provider earnings");
      return null;
    }
    
    // Update the provider's profile with new earnings data
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        jobs_completed: supabase.rpc('increment', { inc: 1 }),
        pending_earnings: supabase.rpc('increment', { inc: netAmount }),
        total_earnings: supabase.rpc('increment', { inc: netAmount })
      })
      .eq('id', offerData.provider_id);
    
    if (profileUpdateError) {
      console.error("Error updating provider profile:", profileUpdateError);
      // We don't fail the whole operation if this part fails,
      // as earnings are recorded but profile stats are just additional info
      toast.error("Provider statistics could not be updated");
    }
    
    return earningsData;
  } catch (error) {
    console.error("Unexpected error in recordEarnings:", error);
    toast.error("Failed to record earnings due to an unexpected error");
    return null;
  }
}
