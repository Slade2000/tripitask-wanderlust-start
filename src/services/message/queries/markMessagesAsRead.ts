
import { supabase } from "@/integrations/supabase/client";

/**
 * Marks messages as read in a conversation
 * @param taskId The task ID (can be null to mark all messages)
 * @param receiverId The ID of the user receiving the messages
 * @param senderId The ID of the user sending the messages
 */
export async function markMessagesAsRead(
  taskId: string | null, 
  receiverId: string, 
  senderId: string
): Promise<boolean> {
  try {
    console.log(`Marking messages as read from ${senderId} to ${receiverId}${taskId ? ` for task ${taskId}` : ''}`);
    
    let query = supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', receiverId)
      .eq('sender_id', senderId)
      .eq('read', false);
    
    // If taskId is provided, add it to the query
    if (taskId) {
      query = query.eq('task_id', taskId);
    }
    
    const { error, count } = await query;
    
    if (error) {
      console.error("Error marking messages as read:", error);
      return false;
    }
    
    console.log(`Marked ${count} messages as read`);
    return true;
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    throw new Error(`Failed to mark messages as read: ${error instanceof Error ? error.message : String(error)}`);
  }
}
