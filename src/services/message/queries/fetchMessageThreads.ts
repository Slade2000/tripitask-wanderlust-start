
import { supabase } from "@/integrations/supabase/client";
import { MessageThreadSummary } from "../types";

/**
 * Fetches a list of message threads for a user, consolidated by other user
 */
export async function fetchMessageThreads(userId: string): Promise<MessageThreadSummary[]> {
  try {
    console.log("Fetching message threads for user:", userId);
    
    // Get all messages involving the user, grouped by conversation
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        task_id,
        sender_id,
        receiver_id, 
        content,
        created_at,
        read,
        tasks:task_id (title),
        sender_profile:sender_id (full_name, avatar_url),
        receiver_profile:receiver_id (full_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching message threads:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No message threads found for user:", userId);
      return [];
    }

    // Group messages by conversation partner
    const conversationsMap: Record<string, any[]> = {};

    data.forEach(message => {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      
      if (!conversationsMap[otherUserId]) {
        conversationsMap[otherUserId] = [];
      }
      
      conversationsMap[otherUserId].push(message);
    });
    
    // Create thread summaries from the grouped conversations
    const threads: MessageThreadSummary[] = [];
    
    for (const [otherUserId, messages] of Object.entries(conversationsMap)) {
      // Get the most recent message
      const latestMessage = messages[0];
      
      // Determine user names and avatars
      const otherUserProfile = latestMessage.sender_id === userId 
        ? latestMessage.receiver_profile 
        : latestMessage.sender_profile;
      
      // Count unread messages
      const unreadCount = messages.filter(msg => 
        msg.sender_id !== userId && !msg.read
      ).length;
      
      threads.push({
        task_id: latestMessage.task_id,
        task_title: latestMessage.tasks?.title || "Unknown Task",
        last_message_content: latestMessage.content || "",
        last_message_date: latestMessage.created_at || new Date().toISOString(),
        unread_count: unreadCount,
        other_user_id: otherUserId,
        other_user_name: otherUserProfile?.full_name || "Unknown User",
        other_user_avatar: otherUserProfile?.avatar_url
      });
    }
    
    // Sort threads by last message date
    threads.sort((a, b) => 
      new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime()
    );

    console.log("Consolidated message threads:", threads);
    return threads;
  } catch (error) {
    console.error("Error in fetchMessageThreads:", error);
    throw new Error("Failed to load messages: " + (error instanceof Error ? error.message : String(error)));
  }
}
