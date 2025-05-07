
import { supabase } from "@/integrations/supabase/client";
import { TaskFilterParams } from "../types";
import { applyTaskFilters } from "./filterTasks";

export async function getAllAvailableTasks(filters: TaskFilterParams = {}) {
  try {
    console.log("Fetching all available tasks with filters:", filters);
    
    // Build query with filters
    let query = supabase
      .from('tasks')
      .select(`
        *,
        categories(name, description)
      `);
    
    // Only filter by status if we're not in development mode
    // For testing, we'll show all tasks regardless of status
    // Remove this condition in production
    if (import.meta.env.PROD) {
      query = query.eq('status', 'open');
    }
    
    // Filter out current user's tasks if userId is provided
    if (filters.userId) {
      console.log("Excluding tasks from current user:", filters.userId);
      query = query.neq('user_id', filters.userId);
    }
    
    // Apply search query filter if provided
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const searchTerm = `%${filters.searchQuery.toLowerCase()}%`;
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`);
    }
    
    // Apply category filter if provided
    if (filters.categoryId && filters.categoryId !== 'all') {
      query = query.eq('category_id', filters.categoryId);
    }
    
    // Execute the query
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error("Database error when fetching tasks:", error);
      throw error;
    }
    
    console.log("Raw tasks data from database:", data);
    
    // Apply post-query filters (budget and location)
    const filteredTasks = applyTaskFilters(data || [], filters);
    
    console.log(`Returning ${filteredTasks.length} tasks after all filters`);
    return filteredTasks;
  } catch (error) {
    console.error("Error fetching available tasks:", error);
    return [];
  }
}
