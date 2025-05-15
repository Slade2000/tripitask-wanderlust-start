
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
    
    // Ensure numeric values are converted properly
    const earnings = data.map(earning => ({
      ...earning,
      amount: Number(earning.amount),
      commission_amount: Number(earning.commission_amount),
      net_amount: Number(earning.net_amount)
    }));
    
    return earnings as unknown as ProviderEarning[];
  } catch (error) {
    console.error("Unexpected error in getProviderEarnings:", error);
    return [];
  }
}
