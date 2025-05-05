
import { supabase } from "@/integrations/supabase/client";
import { TaskFilterParams } from "./types";
import { calculateDistance } from "../locationService";

export async function getUserTasks(userId: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_photos(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return [];
  }
}

export async function getTaskById(taskId: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_photos(*),
        categories(name, description)
      `)
      .eq('id', taskId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching task details:", error);
    return null;
  }
}

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
    
    // Apply search query filter if provided
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const searchTerm = `%${filters.searchQuery.toLowerCase()}%`;
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`);
    }
    
    // Apply category filter if provided
    if (filters.categoryId && filters.categoryId !== 'all') {
      query = query.eq('category_id', filters.categoryId);
    }
    
    // Apply budget filter if provided
    if (filters.maxBudget) {
      // Convert number to string for comparison if budget is stored as text
      query = query.lte('budget', filters.maxBudget.toString());
    }
    
    // Execute the query
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error("Database error when fetching tasks:", error);
      throw error;
    }
    
    console.log("Raw tasks data from database:", data);
    
    let filteredTasks = data || [];
    
    // Apply location distance filter if coordinates are provided
    // This has to be done client-side since we don't have PostGIS extensions
    if (filters.latitude && filters.longitude && filters.distanceRadius) {
      console.log("Filtering tasks by distance:", {
        userLat: filters.latitude,
        userLong: filters.longitude,
        radius: filters.distanceRadius
      });
      
      filteredTasks = filteredTasks.filter(task => {
        if (!task.latitude || !task.longitude) {
          console.log(`Task ${task.id} has no coordinates, excluding from distance filter`);
          return false;
        }
        
        const distance = calculateDistance(
          filters.latitude!, 
          filters.longitude!, 
          task.latitude, 
          task.longitude
        );
        
        console.log(`Task ${task.id} is ${distance.toFixed(1)}km away (max: ${filters.distanceRadius}km)`);
        return distance <= filters.distanceRadius;
      });
    }
    
    console.log(`Returning ${filteredTasks.length} tasks after all filters`);
    return filteredTasks;
  } catch (error) {
    console.error("Error fetching available tasks:", error);
    return [];
  }
}
