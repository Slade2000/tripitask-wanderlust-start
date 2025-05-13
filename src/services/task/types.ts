export interface TaskData {
  id?: string;
  title: string;
  description: string;
  budget: string;
  location: string;
  user_id: string;
  due_date: string;
  status?: string;
  category_id: string;
  photos?: (string | File)[]; // Allow both File objects and string URLs
  task_photos?: { photo_url: string }[]; // Match database structure
  categories?: any;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
}

export interface TaskFilterParams {
  searchQuery?: string;
  categoryId?: string;
  distanceRadius?: number;
  minBudget?: number;
  maxBudget?: number;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  userId?: string;  // Added userId to filter out current user's tasks
}

export interface Offer {
  id: string;
  task_id: string;
  provider_id: string;
  amount: number;
  net_amount?: number;
  expected_delivery_date: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}
