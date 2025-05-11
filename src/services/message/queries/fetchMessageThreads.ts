
import { supabase } from "@/integrations/supabase/client";
import { MessageThreadSummary } from "../types";

/**
 * Fetches a list of message threads for a user
 */
export async function fetchMessageThreads(userId: string): Promise<MessageThreadSummary[]> {
  try {
    console.log("Fetching message threads for user:", userId);
    
    // Query the message_threads view
    const { data, error } = await supabase
      .from('message_threads')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('last_message_date', { ascending: false });

    if (error) {
      console.error("Error fetching message threads:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No message threads found for user:", userId);
      return [];
    }

    // Convert to MessageThreadSummary objects
    const threads: MessageThreadSummary[] = data.map((thread: any) => {
      // Determine the other user in the conversation (not the current user)
      const otherUserId = thread.sender_id === userId ? thread.receiver_id : thread.sender_id;
      const otherUserName = thread.sender_id === userId ? thread.receiver_name : thread.sender_name;
      const otherUserAvatar = thread.sender_id === userId ? thread.receiver_avatar : thread.sender_avatar;
      
      return {
        task_id: thread.task_id,
        task_title: thread.task_title || "Unknown Task",
        last_message_content: thread.last_message_content || "",
        last_message_date: thread.last_message_date || new Date().toISOString(),
        unread_count: thread.unread_count || 0,
        other_user_id: otherUserId || "",
        other_user_name: otherUserName || "Unknown User",
        other_user_avatar: otherUserAvatar
      };
    });

    console.log("Processed message threads:", threads.length);
    return threads;
  } catch (error) {
    console.error("Error in fetchMessageThreads:", error);
    throw error;
  }
}
