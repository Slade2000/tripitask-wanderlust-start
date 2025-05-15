
import { supabase } from "@/integrations/supabase/client";
import { WalletTransaction } from "./types";

/**
 * Retrieves wallet transaction history for a provider
 * 
 * @param providerId The provider ID to get transactions for
 * @param limit Optional limit on the number of records to return
 * @returns Array of wallet transactions or empty array if none found
 */
export async function getWalletTransactions(
  providerId: string,
  limit: number = 50
): Promise<WalletTransaction[]> {
  try {
    if (!providerId) {
      console.error("Provider ID is required to fetch wallet transactions");
      return [];
    }

    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching wallet transactions:", error);
      return [];
    }

    return data as WalletTransaction[];
  } catch (err) {
    console.error("Unexpected error fetching wallet transactions:", err);
    return [];
  }
}

/**
 * Initialize a withdrawal transaction from provider's available balance
 * 
 * @param providerId Provider requesting the withdrawal
 * @param amount Amount to withdraw
 * @returns The created transaction or null if failed
 */
export async function initiateWithdrawal(
  providerId: string,
  amount: number
): Promise<WalletTransaction | null> {
  try {
    if (!providerId || !amount || amount <= 0) {
      console.error("Invalid withdrawal parameters");
      return null;
    }

    // First check if the provider has sufficient available balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('available_balance')
      .eq('id', providerId)
      .single();

    if (profileError || !profile) {
      console.error("Could not retrieve provider profile:", profileError);
      return null;
    }

    if (!profile.available_balance || profile.available_balance < amount) {
      console.error("Insufficient available balance for withdrawal");
      return null;
    }

    // Create the withdrawal transaction (pending status)
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert([{
        provider_id: providerId,
        amount,
        transaction_type: 'withdrawal',
        status: 'pending',
        reference: null
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating withdrawal transaction:", error);
      return null;
    }

    // Update the provider's available balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        available_balance: supabase.rpc('decrement', { row_id: providerId, dec: amount }) as any
      })
      .eq('id', providerId);

    if (updateError) {
      console.error("Error updating provider balance:", updateError);
      // If we failed to update the balance, we should roll back the transaction
      await supabase.from('wallet_transactions').delete().eq('id', data.id);
      return null;
    }

    return data as WalletTransaction;
  } catch (err) {
    console.error("Unexpected error initiating withdrawal:", err);
    return null;
  }
}
