
import { supabase } from "@/integrations/supabase/client";
import { ProviderEarning, ProviderEarningsStatistics } from "./types";

/**
 * Gets all earnings for a provider
 * 
 * @param providerId The provider ID
 * @param status Optional filter by earnings status
 * @returns Array of provider earnings
 */
export async function getProviderEarnings(
  providerId: string, 
  status?: 'pending' | 'available' | 'withdrawn'
): Promise<ProviderEarning[]> {
  try {
    let query = supabase
      .from('provider_earnings')
      .select(`
        *,
        tasks:task_id (title, description),
        offers:offer_id (amount, expected_delivery_date)
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching provider earnings:", error);
      return [];
    }
    
    return data as unknown as ProviderEarning[];
  } catch (error) {
    console.error("Unexpected error in getProviderEarnings:", error);
    return [];
  }
}

/**
 * Gets earnings statistics for a provider
 * 
 * @param providerId The provider ID
 * @returns Provider earnings statistics
 */
export async function getProviderEarningsStatistics(
  providerId: string
): Promise<ProviderEarningsStatistics | null> {
  try {
    console.log(`Fetching earnings statistics for provider: ${providerId}`);
    
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        total_earnings,
        available_balance,
        pending_earnings,
        total_withdrawn,
        jobs_completed
      `)
      .eq('id', providerId)
      .single();
    
    if (error) {
      console.error("Error fetching provider earnings statistics:", error);
      return null;
    }
    
    console.log("Raw earnings statistics data:", data);
    console.log("Data types:", {
      total_earnings: typeof data.total_earnings,
      available_balance: typeof data.available_balance,
      pending_earnings: typeof data.pending_earnings,
      total_withdrawn: typeof data.total_withdrawn
    });
    
    // Ensure all values are numbers
    const statistics: ProviderEarningsStatistics = {
      total_earnings: Number(data.total_earnings) || 0,
      available_balance: Number(data.available_balance) || 0,
      pending_earnings: Number(data.pending_earnings) || 0,
      total_withdrawn: Number(data.total_withdrawn) || 0,
      jobs_completed: data.jobs_completed || 0
    };
    
    console.log("Normalized earnings statistics:", statistics);
    return statistics;
  } catch (error) {
    console.error("Unexpected error in getProviderEarningsStatistics:", error);
    return null;
  }
}
