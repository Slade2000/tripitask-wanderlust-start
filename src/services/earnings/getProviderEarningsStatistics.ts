
import { supabase } from "@/integrations/supabase/client";
import { ProviderEarningsStatistics } from "./types";

/**
 * Get earnings statistics for a provider
 * 
 * @param providerId The provider's ID
 * @returns Provider earnings statistics
 */
export async function getProviderEarningsStatistics(providerId: string): Promise<ProviderEarningsStatistics | null> {
  try {
    if (!providerId) {
      console.error("getProviderEarningsStatistics: No provider ID provided");
      return null;
    }

    console.log(`Fetching earnings statistics for provider: ${providerId}`);
    
    // Step 1: Calculate total completed earnings from provider_earnings
    const { data: completedEarnings, error: completedError } = await supabase
      .from('provider_earnings')
      .select('net_amount')
      .eq('provider_id', providerId)
      .eq('status', 'available');
    
    if (completedError) {
      console.error("Error fetching completed earnings:", completedError);
      return null;
    }

    // Step 2: Calculate pending earnings from pending offers that are accepted
    const { data: pendingOffers, error: pendingError } = await supabase
      .from('offers')
      .select('net_amount')
      .eq('provider_id', providerId)
      .eq('status', 'accepted');
    
    if (pendingError) {
      console.error("Error fetching pending offers:", pendingError);
      return null;
    }
    
    // Step 3: Calculate withdrawn amounts from wallet_transactions
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('provider_id', providerId)
      .eq('transaction_type', 'withdrawal')
      .eq('status', 'completed');
      
    if (withdrawalsError) {
      console.error("Error fetching withdrawals:", withdrawalsError);
      return null;
    }
    
    // Get jobs completed count
    const { count: jobsCompleted, error: countError } = await supabase
      .from('offers')
      .select('id', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('status', 'completed');
    
    if (countError) {
      console.error("Error counting completed jobs:", countError);
      return null;
    }
    
    // Calculate total earnings - sum of all net_amounts in provider_earnings
    let totalEarnings = 0;
    if (completedEarnings && completedEarnings.length > 0) {
      totalEarnings = completedEarnings.reduce((sum, item) => 
        sum + parseFloat(item.net_amount.toString()), 0);
    }
    
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
    
    const stats: ProviderEarningsStatistics = {
      total_earnings: totalEarnings,
      available_balance: availableBalance,
      pending_earnings: pendingEarnings,
      total_withdrawn: totalWithdrawn,
      jobs_completed: jobsCompleted || 0
    };

    console.log("Calculated earnings statistics:", stats);
    return stats;
  } catch (error) {
    console.error("Error getting provider earnings statistics:", error);
    return null;
  }
}

/**
 * Refreshes the earnings data by directly recalculating
 * all values from the database
 * 
 * @param providerId The provider ID
 * @returns Updated provider earnings statistics
 */
export async function refreshProviderEarnings(providerId: string): Promise<ProviderEarningsStatistics | null> {
  try {
    // Process any pending earnings that should now be available
    const now = new Date().toISOString();
    const { data: earningsToUpdate, error: fetchError } = await supabase
      .from('provider_earnings')
      .select('id')
      .eq('provider_id', providerId)
      .eq('status', 'pending')
      .lt('available_at', now);
    
    if (fetchError) {
      console.error("Error fetching earnings to update:", fetchError);
    } else if (earningsToUpdate && earningsToUpdate.length > 0) {
      // Update each earning to available status
      for (const earning of earningsToUpdate) {
        await supabase
          .from('provider_earnings')
          .update({ 
            status: 'available',
            available_at: now
          })
          .eq('id', earning.id);
      }
      
      console.log(`Updated ${earningsToUpdate.length} earnings to available status`);
    }

    // Return freshly calculated statistics
    return getProviderEarningsStatistics(providerId);
  } catch (error) {
    console.error("Error refreshing provider earnings:", error);
    return null;
  }
}
