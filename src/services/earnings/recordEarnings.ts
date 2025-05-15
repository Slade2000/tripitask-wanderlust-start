import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProviderEarning } from "./types";
import { createWalletTransaction } from "./createWalletTransaction";

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
    
    console.log("Offer data retrieved:", offerData);
    
    // Calculate commission - use the net_amount stored in the offer if available, 
    // otherwise calculate based on fixed percentage
    const commissionRate = 0.10; // 10% commission
    const grossAmount = offerData.amount;
    const netAmount = offerData.net_amount || grossAmount * (1 - commissionRate);
    const commissionAmount = grossAmount - netAmount;
    
    console.log("Earnings calculation:", {
      grossAmount,
      netAmount,
      commissionAmount,
      commissionRate
    });
    
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
    
    console.log("Provider earnings recorded successfully:", earningsData);
    
    // Get current profile values before update for debugging
    const { data: currentProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('pending_earnings, total_earnings, jobs_completed')
      .eq('id', offerData.provider_id)
      .single();
      
    if (profileFetchError) {
      console.error("Error fetching current profile data:", profileFetchError);
    } else {
      console.log("Current profile values before update:", currentProfile);
    }
    
    // Direct update to the provider's profile with new earnings data
    // This is better than using the RPC functions which might not be working correctly
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        jobs_completed: (currentProfile?.jobs_completed || 0) + 1,
        pending_earnings: (currentProfile?.pending_earnings || 0) + netAmount,
        total_earnings: (currentProfile?.total_earnings || 0) + netAmount
      })
      .eq('id', offerData.provider_id);
    
    if (profileUpdateError) {
      console.error("Error updating provider profile:", profileUpdateError);
      toast.error("Provider statistics could not be updated");
    } else {
      console.log("Provider profile updated successfully with new earnings");
    }

    // Create a wallet transaction record for this deposit
    const reference = `earnings:${earningsData.id}`;
    const walletTransaction = await createWalletTransaction(
      offerData.provider_id,
      netAmount,
      'deposit',
      reference
    );
    
    if (walletTransaction) {
      console.log("Wallet transaction created successfully:", walletTransaction);
    } else {
      console.error("Failed to create wallet transaction");
    }
    
    return earningsData as unknown as ProviderEarning;
  } catch (error) {
    console.error("Unexpected error in recordEarnings:", error);
    toast.error("Failed to record earnings due to an unexpected error");
    return null;
  }
}
