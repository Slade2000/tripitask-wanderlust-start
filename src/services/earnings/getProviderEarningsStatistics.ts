
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
    
    // Get the profile data which contains the pre-calculated totals
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('total_earnings, available_balance, pending_earnings, total_withdrawn, jobs_completed')
      .eq('id', providerId)
      .single();
    
    if (profileError) {
      console.error("Error fetching profile earnings data:", profileError);
      return null;
    }

    if (!profileData) {
      console.error("No profile data found for provider:", providerId);
      return null;
    }

    // Ensure all values are numbers
    const stats: ProviderEarningsStatistics = {
      total_earnings: Number(profileData.total_earnings || 0),
      available_balance: Number(profileData.available_balance || 0),
      pending_earnings: Number(profileData.pending_earnings || 0),
      total_withdrawn: Number(profileData.total_withdrawn || 0),
      jobs_completed: Number(profileData.jobs_completed || 0)
    };

    console.log("Earnings statistics:", stats);
    return stats;

  } catch (error) {
    console.error("Error getting provider earnings statistics:", error);
    return null;
  }
}

/**
 * Refreshes the earnings data for a provider by
 * recalculating all values from the database
 * 
 * @param providerId The provider ID
 * @returns Updated provider earnings statistics
 */
export async function refreshProviderEarnings(providerId: string): Promise<ProviderEarningsStatistics | null> {
  try {
    // Call the sync function to recalculate and sync all values
    const { data, error } = await supabase
      .functions
      .invoke('sync-provider-earnings', {
        body: { providerId }
      });
    
    if (error) {
      console.error("Error refreshing provider earnings:", error);
      return null;
    }

    // Fetch the updated earnings statistics
    return await getProviderEarningsStatistics(providerId);
    
  } catch (error) {
    console.error("Error refreshing provider earnings:", error);
    return null;
  }
}
