
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
  photos?: string[]; // Changed from File[] to string[] for compatibility
  task_photos?: any[]; // Added to match database structure
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
