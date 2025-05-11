
import { supabase } from "@/integrations/supabase/client";

/**
 * Marks all messages from a specific sender to the current user as read
 * @param taskId The ID of the task associated with the messages. If null, marks all messages from the sender as read.
 * @param userId The current user's ID
 * @param senderId The ID of the user who sent the messages
 */
export async function markMessagesAsRead(taskId: string | null, userId: string, senderId: string) {
  try {
    console.log(`Marking messages as read - Task: ${taskId || 'all'}, User: ${userId}, Sender: ${senderId}`);
    
    // Start building the query
    let query = supabase
      .from('messages')
      .update({ read: true })
      .match({
        receiver_id: userId,
        sender_id: senderId,
        read: false
      });
      
    // If taskId is provided, add it to the match criteria
    if (taskId) {
      query = query.eq('task_id', taskId);
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
    
    console.log("Messages marked as read successfully");
    return { success: true };
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
