
import { supabase } from "@/integrations/supabase/client";

/**
 * Marks all messages from a specific sender to the current user as read
 * @param taskId The ID of the task associated with the messages
 * @param userId The current user's ID
 * @param senderId The ID of the user who sent the messages
 */
export async function markMessagesAsRead(taskId: string, userId: string, senderId: string) {
  try {
    console.log(`Marking messages as read - Task: ${taskId}, User: ${userId}, Sender: ${senderId}`);
    
    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .match({
        task_id: taskId,
        receiver_id: userId,
        sender_id: senderId,
        read: false
      });
      
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
