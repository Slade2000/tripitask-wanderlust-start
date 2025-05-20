
import { supabase } from "@/integrations/supabase/client";

export interface TaskFilters {
  search?: string;
  categories?: string[];
  minBudget?: number;
  maxBudget?: number;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  maxDistance?: number;
  latitude?: number;
  longitude?: number;
  limit?: number;
  offset?: number;
  userId?: string; // Added userId to exclude user's own tasks
}

export async function filterTasks(filters: TaskFilters) {
  try {
    console.log("Filtering tasks with:", filters);
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        categories:category_id (*),
        task_photos (photo_url)
      `)
      .eq('status', 'open'); // Only select tasks with status 'open'

    // Exclude current user's tasks if userId is provided
    if (filters.userId) {
      query = query.neq('user_id', filters.userId);
    }

    // Apply text search filter
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      query = query.in('category_id', filters.categories);
    }

    // Apply budget range filter
    if (filters.minBudget !== undefined) {
      // Convert budget string to number for comparison
      query = query.gte('budget', filters.minBudget.toString());
    }
    if (filters.maxBudget !== undefined) {
      query = query.lte('budget', filters.maxBudget.toString());
    }

    // Apply date range filter
    if (filters.startDate) {
      query = query.gte('due_date', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('due_date', filters.endDate.toISOString());
    }

    // Apply location filter (simple text match)
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    // Order by created_at (newest first)
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error filtering tasks:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error in filterTasks:", error);
    return [];
  }
}

// Subscribe to real-time task updates
export function subscribeToTaskUpdates(callback: (payload: any) => void) {
  try {
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: 'status=eq.open'
        }, 
        (payload) => {
          console.log('Real-time task update received:', payload);
          callback(payload);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Error subscribing to task updates:', error);
    return () => {};
  }
}
