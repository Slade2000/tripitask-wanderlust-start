
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Updates the task status to pending_complete if the current user is an accepted provider for the task
 * This calls a PostgreSQL function with elevated privileges to bypass RLS
 * @param taskId The task ID to update
 * @param providerId The provider ID making the request 
 * @returns Object with success status and any error message
 */
export async function updateTaskStatusForProvider(taskId: string, providerId: string) {
  if (!taskId || !providerId) {
    console.error("Missing required parameters:", { taskId, providerId });
    return { success: false, error: "Missing required parameters" };
  }
  
  try {
    console.log(`Calling secure function to update task status for task ${taskId} by provider ${providerId}`);
    
    // Call the secure PostgreSQL function
    const { data, error } = await supabase.rpc('update_task_status_for_provider', {
      task_id: taskId,
      provider_id: providerId,
      new_status: 'pending_complete'
    });
    
    if (error) {
      console.error("Error updating task status via secure function:", error);
      return { success: false, error: error.message };
    }
    
    if (data === false) {
      console.warn("Function returned false, provider may not have permission");
      return { success: false, error: "You don't have permission to update this task" };
    }
    
    console.log("Task status successfully updated via secure function:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Exception in updateTaskStatusForProvider:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
