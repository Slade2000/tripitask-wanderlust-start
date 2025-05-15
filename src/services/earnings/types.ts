export interface ProviderEarning {
  id: string;
  provider_id: string;
  task_id: string;
  offer_id: string;
  amount: number;
  commission_amount: number;
  net_amount: number;
  status: 'pending' | 'available' | 'withdrawn';
  created_at: string;
  available_at: string | null;
  withdrawn_at: string | null;
}

/**
 * Represents a wallet transaction record
 */
export interface WalletTransaction {
  id: string;
  provider_id: string;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'cancelled';
  reference: string | null;
  created_at: string;
  completed_at: string | null;
}
