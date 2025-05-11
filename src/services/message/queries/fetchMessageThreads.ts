
import { supabase } from "@/integrations/supabase/client";
import { MessageThreadSummary } from "../types";

/**
 * Fetches a list of message threads for a user, consolidated by other user
 */
export async function fetchMessageThreads(userId: string): Promise<MessageThreadSummary[]> {
  try {
    console.log("Fetching message threads for user:", userId);
    
    // First query: Get all unique conversations the user is involved in
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .select(`
        id,
        task_id,
        sender_id,
        receiver_id, 
        content,
        created_at,
        read,
        tasks:task_id (title)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (messageError) {
      console.error("Error fetching message threads:", messageError);
      throw messageError;
    }

    if (!messageData || messageData.length === 0) {
      console.log("No message threads found for user:", userId);
      return [];
    }

    // Get all unique user IDs from the messages to fetch their profiles in a single query
    const otherUserIds = new Set<string>();
    messageData.forEach(message => {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      otherUserIds.add(otherUserId);
    });

    // Second query: Fetch all profiles for the other users
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', Array.from(otherUserIds));

    if (profileError) {
      console.error("Error fetching user profiles:", profileError);
      throw profileError;
    }

    // Create a map of user profiles for easy lookup
    const profilesMap: Record<string, { full_name: string; avatar_url: string | null }> = {};
    profileData?.forEach(profile => {
      profilesMap[profile.id] = { 
        full_name: profile.full_name || "Unknown User", 
        avatar_url: profile.avatar_url 
      };
    });

    // Group messages by conversation partner
    const conversationsMap: Record<string, any[]> = {};

    messageData.forEach(message => {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      
      if (!conversationsMap[otherUserId]) {
        conversationsMap[otherUserId] = [];
      }
      
      conversationsMap[otherUserId].push(message);
    });
    
    // Create thread summaries from the grouped conversations
    const threads: MessageThreadSummary[] = [];
    
    for (const [otherUserId, messages] of Object.entries(conversationsMap)) {
      // Sort messages to get the latest first
      messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Get the most recent message
      const latestMessage = messages[0];
      
      // Get profile info for the other user
      const otherUserProfile = profilesMap[otherUserId] || { full_name: "Unknown User", avatar_url: null };
      
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
        other_user_name: otherUserProfile.full_name,
        other_user_avatar: otherUserProfile.avatar_url
      });
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
