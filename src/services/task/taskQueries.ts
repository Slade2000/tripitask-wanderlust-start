
import { supabase } from "@/integrations/supabase/client";
import { TaskFilterParams } from "./types";

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
    // In a real implementation, you would use the filters to query the tasks table
    // For now, we'll return mock data
    
    // Mock tasks data
    const mockTasks = [
      {
        id: "task-1",
        title: "Help moving furniture",
        description: "Need help moving furniture from apartment to new house",
        budget: "120",
        location: "Sydney CBD",
        user_id: "user-1",
        due_date: new Date(Date.now() + 3 * 86400000).toISOString(),
        status: "open",
        category_id: "category-1",
        latitude: -33.8688,
        longitude: 151.2093
      },
      {
        id: "task-2",
        title: "Garden maintenance",
        description: "Regular garden maintenance needed for front and back yard",
        budget: "80",
        location: "Melbourne",
        user_id: "user-2",
        due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: "open",
        category_id: "category-2",
        latitude: -37.8136,
        longitude: 144.9631
      },
      {
        id: "task-3",
        title: "Website development",
        description: "Create a simple portfolio website",
        budget: "500",
        location: "Perth",
        user_id: "user-3",
        due_date: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: "open",
        category_id: "category-3",
        latitude: -31.9505,
        longitude: 115.8605
      },
      {
        id: "task-4",
        title: "Dog walking service",
        description: "Need someone to walk my dog daily for the next week",
        budget: "150",
        location: "Brisbane",
        user_id: "user-4",
        due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
        status: "open",
        category_id: "category-4",
        latitude: -27.4698,
        longitude: 153.0251
      }
    ];
    
    // Apply mock filtering
    let filteredTasks = [...mockTasks];
    
    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query) ||
        task.location.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (filters.categoryId) {
      filteredTasks = filteredTasks.filter(task => task.category_id === filters.categoryId);
    }
    
    // Filter by budget
    if (filters.maxBudget) {
      filteredTasks = filteredTasks.filter(task => parseInt(task.budget) <= filters.maxBudget);
    }
    
    // In a real implementation, you would use the user's current location and calculate distance
    // between the user and each task to filter by distanceRadius
    
    return filteredTasks;
    
    // Later, replace with actual Supabase query:
    /*
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        categories(name)
      `)
      .eq('status', 'open');

    if (error) {
      throw error;
    }

    return data || [];
    */
  } catch (error) {
    console.error("Error fetching available tasks:", error);
    return [];
  }
}
