
export interface Offer {
  id: string;
  task_id: string;
  provider_id: string;
  amount: number;
  net_amount?: number; // Amount after commission
  expected_delivery_date: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'work_completed' | 'completed';
  created_at: string;
  completed_at?: string;
  provider?: {
    id: string;
    name?: string;
    avatar_url?: string;
    rating?: number;
    success_rate?: string;
  };
  provider_details?: any; // Adding this property to fix the TypeScript error
  task?: {
    title: string;
    description?: string;
    budget: string;
    due_date: string;
    status: string;
  };
}
