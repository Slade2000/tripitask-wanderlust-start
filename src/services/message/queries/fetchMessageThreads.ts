
import { supabase } from "@/integrations/supabase/client";
import { MessageThreadSummary } from "../types";

/**
 * Fetches a list of message threads for a user
 */
export async function fetchMessageThreads(userId: string): Promise<MessageThreadSummary[]> {
  try {
    console.log("Fetching message threads for user:", userId);
    
    // Query the message_threads view - it already filters for the current user
    // so we don't need to add a condition for sender_id or receiver_id
    const { data, error } = await supabase
      .from('message_threads')
      .select('*')
      .order('last_message_date', { ascending: false });

    if (error) {
      console.error("Error fetching message threads:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No message threads found for user:", userId);
      return [];
    }

    console.log("Raw message threads data:", data);

    // Convert to MessageThreadSummary objects
    const threads: MessageThreadSummary[] = data.map((thread: any) => {
      // Determine the other user in the conversation (not the current user)
      const otherUserId = thread.other_user_id || "";
      const otherUserName = thread.other_user_name || "Unknown User";
      const otherUserAvatar = thread.other_user_avatar;
      
      return {
        task_id: thread.task_id,
        task_title: thread.task_title || "Unknown Task",
        last_message_content: thread.last_message_content || "",
        last_message_date: thread.last_message_date || new Date().toISOString(),
        unread_count: thread.unread_count || 0,
        other_user_id: otherUserId,
        other_user_name: otherUserName,
        other_user_avatar: otherUserAvatar
      };
    });

    console.log("Processed message threads:", threads);
    return threads;
  } catch (error) {
    console.error("Error in fetchMessageThreads:", error);
    throw new Error("Failed to load messages: " + (error instanceof Error ? error.message : String(error)));
  }
}
