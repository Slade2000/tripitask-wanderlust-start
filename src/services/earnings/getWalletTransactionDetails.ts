

import { supabase } from "@/integrations/supabase/client";

/**
 * Get transaction details from the wallet_transaction_details table
 * This is a separate function to handle any type issues
 * 
 * @param providerId The provider ID
 * @returns Array of transaction details or empty array if error
 */
export async function getWalletTransactionDetails(providerId: string): Promise<any[]> {
  try {
    // Use a direct query with any() to bypass TypeScript issues
    // by using a raw query approach
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select(`
        id,
        amount,
        transaction_type,
        status
      `)
      .eq('provider_id', providerId)
      .eq('transaction_type', 'payment')
      .eq('status', 'completed');
    
    if (error) {
      console.error("Error in getWalletTransactionDetails:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Exception in getWalletTransactionDetails:", error);
    return [];
  }
}

/**
 * Alternative approach using a custom SQL query via PostgrestFilterBuilder.or
 */
export async function getWalletPayments(providerId: string): Promise<any[]> {
  try {
    // Query wallet_transactions table instead, which should be defined in types
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('provider_id', providerId)
      .eq('transaction_type', 'payment')
      .eq('status', 'completed');
    
    if (error) {
      console.error("Error fetching wallet payments:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Exception in getWalletPayments:", error);
    return [];
  }
}
