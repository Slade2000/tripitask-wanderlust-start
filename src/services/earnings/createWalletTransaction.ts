
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WalletTransaction } from "./types";

/**
 * Creates a wallet transaction record
 * 
 * @param providerId The provider ID who owns the transaction
 * @param amount The transaction amount
 * @param transactionType Type of transaction ('deposit' or 'withdrawal')
 * @param reference Optional reference information (e.g., task ID, earnings ID)
 * @returns The created wallet transaction or null if it failed
 */
export async function createWalletTransaction(
  providerId: string,
  amount: number,
  transactionType: 'deposit' | 'withdrawal',
  reference: string | null = null
): Promise<WalletTransaction | null> {
  try {
    console.log(`Creating ${transactionType} wallet transaction for provider ${providerId} of amount ${amount} with reference ${reference}`);
    
    if (!providerId || !amount) {
      console.error("Missing required information for wallet transaction", { providerId, amount });
      return null;
    }

    // Status is completed for deposits (automatic), pending for withdrawals (requires approval)
    const initialStatus = transactionType === 'deposit' ? 'completed' : 'pending';
    const completedAt = transactionType === 'deposit' ? new Date().toISOString() : null;
    
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert([{
        provider_id: providerId,
        amount,
        transaction_type: transactionType,
        status: initialStatus,
        reference,
        completed_at: completedAt
      }])
      .select()
      .single();
      
    if (error) {
      console.error(`Error creating wallet transaction:`, error);
      // We don't show a toast here as this might be part of a larger operation
      return null;
    }
    
    console.log(`Successfully created ${transactionType} wallet transaction:`, data);
    
    // Check if the trigger function updated the profile balance
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('available_balance, pending_earnings')
      .eq('id', providerId)
      .single();
      
    if (profileError) {
      console.error("Error fetching updated profile data:", profileError);
    } else {
      console.log("Updated profile balances after transaction:", profileData);
    }
    
    return data as WalletTransaction;
  } catch (err) {
    console.error("Unexpected error creating wallet transaction:", err);
    return null;
  }
}
