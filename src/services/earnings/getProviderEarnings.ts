
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
    
    return data as ProviderEarningsStatistics;
  } catch (error) {
    console.error("Unexpected error in getProviderEarningsStatistics:", error);
    return null;
  }
}
