
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
    
    // Get total of all earnings by status using a raw SQL query instead of groupBy
    const { data: earningsSummary, error: summaryError } = await supabase
      .from('provider_earnings')
      .select('status, net_amount')
      .eq('provider_id', providerId);
    
    if (summaryError) {
      console.error("Error fetching earnings summary:", summaryError);
      return false;
    }
    
    // If the query succeeds, process the results
    if (earningsSummary && earningsSummary.length > 0) {
      // Group the earnings by status and sum the amounts
      const summarizedData = earningsSummary.reduce((acc: {status: string, sum: number}[], item) => {
        const existingGroup = acc.find(g => g.status === item.status);
        if (existingGroup) {
          existingGroup.sum += parseFloat(item.net_amount as any);
        } else {
          acc.push({ 
            status: item.status, 
            sum: parseFloat(item.net_amount as any)
          });
        }
        return acc;
      }, []);
      
      // Extract values from the query result
      let pendingTotal = 0;
      let availableTotal = 0;
      let totalEarnings = 0;
      
      summarizedData.forEach((row) => {
        if (row.status === 'pending') {
          pendingTotal = row.sum;
        } else if (row.status === 'available') {
          availableTotal = row.sum;
        }
        totalEarnings += row.sum;
      });
      
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
          pending_earnings: pendingTotal,
          available_balance: availableTotal,
          total_earnings: totalEarnings,
          jobs_completed: jobsCompleted || 0
        })
        .eq('id', providerId);
      
      if (updateError) {
        console.error("Error updating profile earnings totals:", updateError);
        return false;
      }
      
      console.log(`Successfully synced profile earnings for provider ${providerId}`, {
        pendingTotal,
        availableTotal,
        totalEarnings,
        jobsCompleted
      });
      
      return true;
    } 
    
    else {
      // If the query fails or returns empty, let's use a manual approach
      // Fetch all earnings for this provider and calculate totals manually
      const { data: allEarnings, error: allEarningsError } = await supabase
        .from('provider_earnings')
        .select('status, net_amount')
        .eq('provider_id', providerId);
      
      if (allEarningsError) {
        console.error("Error fetching all earnings:", allEarningsError);
        return false;
      }
      
      // Calculate totals by status
      let pendingTotal = 0;
      let availableTotal = 0;
      let totalEarnings = 0;
      
      allEarnings.forEach(row => {
        const amount = parseFloat(row.net_amount.toString());
        if (row.status === 'pending') {
          pendingTotal += amount;
        } else if (row.status === 'available') {
          availableTotal += amount;
        }
        
        // Total earnings includes all statuses
        totalEarnings += amount;
      });
      
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
          pending_earnings: pendingTotal,
          available_balance: availableTotal,
          total_earnings: totalEarnings,
          jobs_completed: jobsCompleted || 0
        })
        .eq('id', providerId);
      
      if (updateError) {
        console.error("Error updating profile earnings totals:", updateError);
        return false;
      }
      
      console.log(`Successfully synced profile earnings for provider ${providerId}`, {
        pendingTotal,
        availableTotal,
        totalEarnings,
        jobsCompleted
      });
      
      return true;
    }
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
