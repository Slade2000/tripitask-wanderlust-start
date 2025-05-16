
import { supabase } from "@/integrations/supabase/client";

/**
 * Syncs a provider's profile earnings totals with the actual earnings records
 * This is useful if the profile totals get out of sync with the actual earnings
 * 
 * @param providerId The ID of the provider to sync earnings for
 * @returns Whether the sync was successful
 */
export async function syncProfileEarnings(providerId: string): Promise<boolean> {
  try {
    console.log(`Syncing profile earnings for provider: ${providerId}`);
    
    // Step 1: Calculate total completed earnings from provider_earnings
    const { data: completedEarnings, error: completedError } = await supabase
      .from('provider_earnings')
      .select('net_amount')
      .eq('provider_id', providerId)
      .eq('status', 'available');
    
    if (completedError) {
      console.error("Error fetching completed earnings:", completedError);
      return false;
    }

    // Step 2: Get wallet transaction earnings (payments)
    const { data: walletPayments, error: walletError } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('provider_id', providerId)
      .eq('transaction_type', 'payment')
      .eq('status', 'completed');
    
    if (walletError) {
      console.error("Error fetching wallet payments:", walletError);
      return false;
    }

    // Step 3: Calculate pending earnings from pending offers that are accepted
    const { data: pendingOffers, error: pendingError } = await supabase
      .from('offers')
      .select('net_amount, task_id')
      .eq('provider_id', providerId)
      .eq('status', 'accepted');
    
    if (pendingError) {
      console.error("Error fetching pending offers:", pendingError);
      return false;
    }
    
    // Step 4: Calculate withdrawn amounts from wallet_transactions
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('provider_id', providerId)
      .eq('transaction_type', 'withdrawal')
      .eq('status', 'completed');
      
    if (withdrawalsError) {
      console.error("Error fetching withdrawals:", withdrawalsError);
      return false;
    }
    
    // Calculate total earnings from provider_earnings
    let totalEarningsFromProviderTable = 0;
    if (completedEarnings && completedEarnings.length > 0) {
      totalEarningsFromProviderTable = completedEarnings.reduce((sum, item) => 
        sum + parseFloat(item.net_amount.toString()), 0);
    }
    
    // Calculate total earnings from wallet transactions
    let totalEarningsFromWallet = 0;
    if (walletPayments && walletPayments.length > 0) {
      totalEarningsFromWallet = walletPayments.reduce((sum, item) => 
        sum + parseFloat(item.amount.toString()), 0);
    }
    
    // Combined total earnings
    const totalEarnings = totalEarningsFromProviderTable + totalEarningsFromWallet;
    
    // Calculate pending earnings - sum of all net_amounts in pending offers
    let pendingEarnings = 0;
    if (pendingOffers && pendingOffers.length > 0) {
      pendingEarnings = pendingOffers.reduce((sum, item) => 
        sum + (item.net_amount ? parseFloat(item.net_amount.toString()) : 0), 0);
    }
    
    // Calculate total withdrawn amount
    let totalWithdrawn = 0;
    if (withdrawals && withdrawals.length > 0) {
      totalWithdrawn = withdrawals.reduce((sum, item) => 
        sum + parseFloat(item.amount.toString()), 0);
    }

    // Available balance is total earnings minus withdrawn
    const availableBalance = totalEarnings - totalWithdrawn;
    
    // Get count of completed jobs (offers with 'completed' status)
    const { count: jobsCompleted, error: countError } = await supabase
      .from('offers')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('status', 'completed');
    
    if (countError) {
      console.error("Error counting completed jobs:", countError);
      return false;
    }
    
    // Update the profile with the correct totals
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        pending_earnings: pendingEarnings,
        available_balance: availableBalance,
        total_earnings: totalEarnings,
        total_withdrawn: totalWithdrawn,
        jobs_completed: jobsCompleted || 0
      })
      .eq('id', providerId);
    
    if (updateError) {
      console.error("Error updating profile earnings totals:", updateError);
      return false;
    }
    
    console.log(`Successfully synced profile earnings for provider ${providerId}`, {
      pendingEarnings,
      availableBalance,
      totalEarnings: {
        total: totalEarnings,
        fromProviderTable: totalEarningsFromProviderTable,
        fromWallet: totalEarningsFromWallet
      },
      totalWithdrawn,
      jobsCompleted
    });
    
    return true;
  } catch (error) {
    console.error("Error syncing profile earnings:", error);
    return false;
  }
}

/**
 * Updates available status for earnings that have reached their available date
 * and syncs the profile totals
 * 
 * @param providerId The provider ID to process
 * @returns The number of earnings updated to available status
 */
export async function processAndSyncProviderEarnings(providerId: string): Promise<number> {
  try {
    // Find earnings that should now be available
    const now = new Date().toISOString();
    const { data: earningsToUpdate, error: fetchError } = await supabase
      .from('provider_earnings')
      .select('id')
      .eq('provider_id', providerId)
      .eq('status', 'pending')
      .lt('available_at', now);
    
    if (fetchError) {
      console.error("Error fetching earnings to update:", fetchError);
      return 0;
    }
    
    if (!earningsToUpdate || earningsToUpdate.length === 0) {
      // Still sync the profile even if no earnings need updating
      await syncProfileEarnings(providerId);
      return 0;
    }
    
    // Update each earning to available status
    const updatePromises = earningsToUpdate.map(earning => 
      supabase
        .from('provider_earnings')
        .update({ 
          status: 'available',
          available_at: now
        })
        .eq('id', earning.id)
    );
    
    await Promise.all(updatePromises);
    
    // Sync the profile totals after updating earnings
    await syncProfileEarnings(providerId);
    
    return earningsToUpdate.length;
  } catch (error) {
    console.error("Error processing and syncing provider earnings:", error);
    return 0;
  }
}
