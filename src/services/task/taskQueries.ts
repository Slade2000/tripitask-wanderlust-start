import { supabase } from "@/integrations/supabase/client";
import { TaskFilterParams } from "./types";
import { calculateDistance } from "../locationService";
import { countOffersForTask } from "./offers/countOffersForTask";

export async function getUserTasks(userId: string) {
  try {
    console.log("Fetching tasks for user:", userId);
    
    if (!userId) {
      console.error("No user ID provided to getUserTasks");
      throw new Error("User ID is required to fetch tasks");
    }
    
    // Get tasks without trying to join with offers
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_photos(*),
        categories(name, description)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error fetching user tasks:", error);
      throw new Error(error.message || "Failed to fetch tasks from database");
    }
    
    if (!data) {
      console.log("No tasks found for user:", userId);
      return [];
    }
    
    // For now, let's use our mock offer counts until we implement the actual relationship
    // Using Promise.all to fetch all offer counts in parallel
    const tasksWithOfferCounts = await Promise.all(data.map(async (task) => {
      // Use our existing mock offer count function
      const offerCount = await countOffersForTask(task.id);
      
      return {
        ...task,
        offer_count: offerCount
      };
    }));
    
    console.log(`Found ${tasksWithOfferCounts.length} tasks for user ${userId}`);
    return tasksWithOfferCounts;
  } catch (error) {
    console.error("Error in getUserTasks:", error);
    // Rethrow with a more informative message
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while fetching your tasks");
    }
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
    
    // Apply location filtering - both by coordinates and by name
    if (filters.locationName) {
      console.log(`Filtering by location name: "${filters.locationName}"`);
      
      // First check if we have coordinates to do distance-based filtering
      if (filters.latitude && filters.longitude && filters.distanceRadius) {
        console.log("Applying distance-based filtering:", {
          userLat: filters.latitude,
          userLong: filters.longitude,
          radius: filters.distanceRadius
        });
        
        filteredTasks = filteredTasks.filter(task => {
          // If task has coordinates, use distance calculation
          if (task.latitude && task.longitude) {
            const distance = calculateDistance(
              filters.latitude!, 
              filters.longitude!, 
              task.latitude, 
              task.longitude
            );
            
            console.log(`Task ${task.id} is ${distance.toFixed(1)}km away (max: ${filters.distanceRadius}km)`);
            return distance <= filters.distanceRadius;
          } 
          // If task doesn't have coordinates but has a location that matches the filter location
          else if (task.location && filters.locationName) {
            // Check if the task location contains the filter location name
            const isInLocation = task.location.toLowerCase().includes(filters.locationName.toLowerCase());
            console.log(`Task ${task.id} has no coordinates, but location "${task.location}" ${isInLocation ? 'matches' : 'does not match'} "${filters.locationName}"`);
            return isInLocation;
          }
          
          console.log(`Task ${task.id} has no coordinates or location, excluding from results`);
          return false;
        });
      }
      // If we don't have coordinates but we have a location name, filter tasks by location name
      else {
        console.log("Applying text-based location filtering");
        filteredTasks = filteredTasks.filter(task => {
          if (!task.location) {
            console.log(`Task ${task.id} has no location, excluding from results`);
            return false;
          }
          
          const isInLocation = task.location.toLowerCase().includes(filters.locationName!.toLowerCase());
          console.log(`Task ${task.id} location: "${task.location}" ${isInLocation ? 'matches' : 'does not match'} "${filters.locationName}"`);
          return isInLocation;
        });
      }
    }
    
    console.log(`Returning ${filteredTasks.length} tasks after all filters`);
    return filteredTasks;
  } catch (error) {
    console.error("Error fetching available tasks:", error);
    return [];
  }
}
