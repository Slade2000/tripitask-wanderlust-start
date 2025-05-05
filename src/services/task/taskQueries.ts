
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
    // Build query with filters
    let query = supabase
      .from('tasks')
      .select(`
        *,
        categories(name, description)
      `)
      .eq('status', 'open');
    
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
      // Budget is stored as text, so we convert it to a number for comparison
      // This isn't ideal, but it's a workaround for the current data structure
      query = query.filter('budget', 'lte', filters.maxBudget.toString());
    }
    
    // Execute the query
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    let filteredTasks = data || [];
    
    // Apply location distance filter if coordinates are provided
    // This has to be done client-side since we don't have PostGIS extensions
    if (filters.latitude && filters.longitude && filters.distanceRadius) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.latitude || !task.longitude) return false;
        
        const distance = calculateDistance(
          filters.latitude!, 
          filters.longitude!, 
          task.latitude, 
          task.longitude
        );
        
        return distance <= filters.distanceRadius;
      });
    }
    
    return filteredTasks;
  } catch (error) {
    console.error("Error fetching available tasks:", error);
    return [];
  }
}
