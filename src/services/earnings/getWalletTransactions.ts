
import { supabase } from "@/integrations/supabase/client";
import { WalletTransaction } from "./types";

/**
 * Gets wallet transactions for a provider
 * 
 * @param providerId The provider ID
 * @param transactionType Optional filter by transaction type
 * @param status Optional filter by transaction status
 * @returns Array of wallet transactions
 */
export async function getWalletTransactions(
  providerId: string,
  transactionType?: 'deposit' | 'withdrawal',
  status?: 'pending' | 'completed' | 'cancelled'
): Promise<WalletTransaction[]> {
  try {
    console.log("Fetching wallet transactions for provider:", providerId);
    
    let query = supabase
      .from('wallet_transactions')
      .select(`
        *,
        provider:provider_id(full_name, email)
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });
    
    if (transactionType) {
      query = query.eq('transaction_type', transactionType);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching wallet transactions:", error);
      return [];
    }
    
    console.log("Fetched wallet transactions:", data);
    return data as unknown as WalletTransaction[];
  } catch (error) {
    console.error("Unexpected error in getWalletTransactions:", error);
    return [];
  }
}

/**
 * Initiates a withdrawal from the provider's available balance
 * 
 * @param providerId The provider ID
 * @param amount The amount to withdraw
 * @returns The created wallet transaction or null if it failed
 */
export async function initiateWithdrawal(
  providerId: string, 
  amount: number
): Promise<WalletTransaction | null> {
  try {
    if (!providerId || amount <= 0) {
      console.error("Invalid withdrawal request:", { providerId, amount });
      return null;
    }

    // First check if provider has enough available balance
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('available_balance')
      .eq('id', providerId)
      .single();
      
    if (profileError || !profileData) {
      console.error("Error checking available balance:", profileError);
      return null;
    }
    
    if (profileData.available_balance < amount) {
      console.error("Insufficient balance for withdrawal", { 
        requested: amount, 
        available: profileData.available_balance 
      });
      return null;
    }
    
    // Create the withdrawal transaction record
    const { data: transactionData, error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert([{
        provider_id: providerId,
        amount,
        transaction_type: 'withdrawal',
        status: 'pending',
        reference: `withdrawal:${new Date().toISOString()}`
      }])
      .select()
      .single();
      
    if (transactionError) {
      console.error("Error creating withdrawal transaction:", transactionError);
      return null;
    }
    
    return transactionData as WalletTransaction;
  } catch (error) {
    console.error("Unexpected error in initiateWithdrawal:", error);
    return null;
  }
}
