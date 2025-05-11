
import { supabase } from "@/integrations/supabase/client";
import { MessageThreadSummary } from "../types";

/**
 * Fetches a list of message threads for a user
 */
export async function fetchMessageThreads(userId: string): Promise<MessageThreadSummary[]> {
  try {
    // Query the message_threads view that we created in the SQL migration
    const { data, error } = await supabase
      .from('message_threads')
      .select()
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('last_message_date', { ascending: false });

    if (error) {
      console.error("Error fetching message threads:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Convert to MessageThreadSummary objects
    const threads: MessageThreadSummary[] = data.map(thread => ({
      task_id: thread.task_id,
      task_title: thread.task_title || "Unknown Task",
      last_message_content: thread.last_message_content || "",
      last_message_date: thread.last_message_date || new Date().toISOString(),
      unread_count: thread.unread_count || 0,
      other_user_id: thread.other_user_id || "",
      other_user_name: thread.other_user_name || "Unknown User",
      other_user_avatar: thread.other_user_avatar
    }));

    return threads;
  } catch (error) {
    console.error("Error in fetchMessageThreads:", error);
    throw error;
  }
}
