
import { supabase } from "@/integrations/supabase/client";
import { MessageThreadSummary } from "../types";

/**
 * Fetches a list of message threads for a user, consolidated by other user
 */
export async function fetchMessageThreads(userId: string): Promise<MessageThreadSummary[]> {
  try {
    console.log("Fetching message threads for user:", userId);
    
    // Convert userId to lowercase for consistency
    const userIdLower = String(userId).toLowerCase();
    
    // Query messages and join with profiles directly
    const { data: threadsData, error } = await supabase
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
        sender:sender_id (full_name, avatar_url),
        receiver:receiver_id (full_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching message threads:", error);
      throw error;
    }

    if (!threadsData || threadsData.length === 0) {
      console.log("No message threads found for user:", userId);
      return [];
    }

    console.log(`Found ${threadsData.length} messages for user:`, userId);

    // Group messages by conversation partner
    const conversationMap: Record<string, any[]> = {};

    threadsData.forEach(message => {
      // Determine the other user involved in the conversation
      const otherUserId = String(message.sender_id).toLowerCase() === userIdLower 
        ? message.receiver_id 
        : message.sender_id;
      
      // Create a key for the conversation if it doesn't exist
      if (!conversationMap[otherUserId]) {
        conversationMap[otherUserId] = [];
      }
      
      conversationMap[otherUserId].push(message);
    });
    
    // Create thread summaries from the grouped conversations
    const threads: MessageThreadSummary[] = [];
    
    for (const [otherUserId, messages] of Object.entries(conversationMap)) {
      // Sort messages to get the latest first
      messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Get the most recent message
      const latestMessage = messages[0];
      
      // Determine if the other user is the sender or receiver of the latest message
      const isOtherUserSender = String(latestMessage.sender_id).toLowerCase() !== userIdLower;
      
      // Get profile info based on whether other user is sender or receiver
      const otherUserProfile = isOtherUserSender 
        ? latestMessage.sender 
        : latestMessage.receiver;
      
      // Count unread messages from the other user
      const unreadCount = messages.filter(msg => 
        String(msg.sender_id).toLowerCase() !== userIdLower && !msg.read
      ).length;
      
      // Create thread summary
      const thread: MessageThreadSummary = {
        task_id: latestMessage.task_id,
        task_title: latestMessage.tasks?.title || "Unknown Task",
        last_message_content: latestMessage.content || "",
        last_message_date: latestMessage.created_at,
        unread_count: unreadCount,
        other_user_id: otherUserId,
        other_user_name: otherUserProfile?.full_name || `User ${otherUserId.slice(0, 8)}...`,
        other_user_avatar: otherUserProfile?.avatar_url
      };
      
      threads.push(thread);
    }
    
    // Sort threads by last message date
    threads.sort((a, b) => 
      new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime()
    );

    console.log("Returning thread summaries:", threads.length);
    return threads;
  } catch (error) {
    console.error("Error in fetchMessageThreads:", error);
    throw new Error("Failed to load messages: " + (error instanceof Error ? error.message : String(error)));
  }
}
