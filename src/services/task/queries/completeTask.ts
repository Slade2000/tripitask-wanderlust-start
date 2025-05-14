
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTaskById } from "./getTaskById";

/**
 * Updates a task's status to completed
 * @param taskId The ID of the task to complete
 * @param userId The ID of the task poster (for validation)
 * @returns The updated task data or null if the operation failed
 */
export async function completeTask(taskId: string, userId: string) {
  if (!taskId || !userId) {
    toast.error("Missing required information to complete task");
    return null;
  }
  
  try {
    // Update task status to completed
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', userId); // Ensure the user is the task poster
      
    if (error) {
      console.error("Error completing task:", error);
      toast.error("Error marking task as completed");
      return null;
    }
    
    toast.success("Task marked as completed!");
    
    // Refresh task data
    const updatedTask = await getTaskById(taskId);
    return updatedTask;
  } catch (err) {
    console.error("Error completing task:", err);
    toast.error("Error marking task as completed");
    return null;
  }
}
