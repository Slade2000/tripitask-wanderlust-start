
import { supabase } from "@/integrations/supabase/client";

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

    // Log the task status to debug
    console.log("Task status from database:", data?.status);
    
    return data;
  } catch (error) {
    console.error("Error fetching task details:", error);
    return null;
  }
}
