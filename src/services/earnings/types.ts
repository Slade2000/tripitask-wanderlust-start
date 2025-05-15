
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

export interface ProviderEarningsStatistics {
  total_earnings: number;
  total_withdrawn: number;
  available_balance: number;
  pending_earnings: number;
  jobs_completed: number;
}

export interface WalletTransaction {
  id: string;
  provider_id: string;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  reference: string | null;
  created_at: string;
  completed_at: string | null;
}
