
export interface Offer {
  id: string;
  task_id: string;
  provider_id: string;
  amount: number;
  expected_delivery_date: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  provider?: {
    id: string;
    name?: string;
    avatar_url?: string;
    rating?: number;
    success_rate?: string;
  };
}
