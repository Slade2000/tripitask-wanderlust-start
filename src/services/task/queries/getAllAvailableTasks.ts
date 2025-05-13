
import { supabase } from "@/integrations/supabase/client";
import { TaskFilterParams } from "../types";

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
    
    // Only show tasks with status 'open' to prevent completed or in progress tasks from showing
    // Remove this condition in development mode
    if (import.meta.env.PROD) {
      query = query.eq('status', 'open');
    } else {
      // Even in development, don't show tasks that aren't available anymore
      query = query.not('status', 'eq', 'completed');
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

// Helper function to apply filters that need to be done in-memory
function applyTaskFilters(tasks: any[], filters: TaskFilterParams) {
  if (!tasks.length) return tasks;
  
  let filteredTasks = [...tasks];
  
  // Apply budget filters
  if (filters.minBudget) {
    filteredTasks = filteredTasks.filter(task => {
      // Handle numeric or string budget values
      const budget = parseFloat(task.budget);
      return !isNaN(budget) && budget >= filters.minBudget!;
    });
  }
  
  if (filters.maxBudget) {
    filteredTasks = filteredTasks.filter(task => {
      const budget = parseFloat(task.budget);
      return !isNaN(budget) && budget <= filters.maxBudget!;
    });
  }
  
  // Apply location distance filter
  if (filters.latitude && filters.longitude && filters.distanceRadius) {
    // Using a simplified approach for now - actual distance calculation would be better
    // This implementation would rely on the latitude/longitude stored in the tasks
    filteredTasks = filteredTasks.filter(task => {
      if (!task.latitude || !task.longitude) return true; // Keep tasks without coordinates
      
      // Calculate distance (Haversine formula would be better)
      const distance = calculateDistance(
        filters.latitude!,
        filters.longitude!,
        task.latitude,
        task.longitude
      );
      
      return distance <= filters.distanceRadius!;
    });
  }
  
  return filteredTasks;
}

// Simple distance calculation (in kilometers)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
