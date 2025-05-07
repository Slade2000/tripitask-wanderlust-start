
import { supabase } from "@/integrations/supabase/client";
import { countOffersForTask } from "../offers/countOffersForTask";

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
