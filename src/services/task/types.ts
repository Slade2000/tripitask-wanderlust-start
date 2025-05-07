
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
  photos: File[];
  latitude?: number | null;
  longitude?: number | null;
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
