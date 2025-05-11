
import { supabase } from "@/integrations/supabase/client";
import { MessageThreadSummary } from "../types";

/**
 * Fetches a list of message threads for a user, consolidated by other user
 */
export async function fetchMessageThreads(userId: string): Promise<MessageThreadSummary[]> {
  try {
    console.log("Fetching message threads for user:", userId);
    
    // Get all threads from the message_threads view
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

    // Group threads by other_user_id to consolidate by user
    const userThreadsMap: Record<string, MessageThreadSummary> = {};
    
    data.forEach((thread: any) => {
      const otherUserId = thread.other_user_id || "";
      
      // If we haven't seen this user yet, or this is a more recent message
      if (!userThreadsMap[otherUserId] || 
          new Date(thread.last_message_date) > new Date(userThreadsMap[otherUserId].last_message_date)) {
        
        userThreadsMap[otherUserId] = {
          task_id: thread.task_id,
          task_title: thread.task_title || "Unknown Task",
          last_message_content: thread.last_message_content || "",
          last_message_date: thread.last_message_date || new Date().toISOString(),
          unread_count: thread.unread_count || 0,
          other_user_id: otherUserId,
          other_user_name: thread.other_user_name || "Unknown User",
          other_user_avatar: thread.other_user_avatar
        };
      } else {
        // If we've seen this user, add to their unread count
        userThreadsMap[otherUserId].unread_count += thread.unread_count || 0;
      }
    });

    // Convert the map back to an array and sort by last message date
    const threads = Object.values(userThreadsMap).sort((a, b) => 
      new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime()
    );

    console.log("Consolidated message threads:", threads);
    return threads;
  } catch (error) {
    console.error("Error in fetchMessageThreads:", error);
    throw new Error("Failed to load messages: " + (error instanceof Error ? error.message : String(error)));
  }
}
