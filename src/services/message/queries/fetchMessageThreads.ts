
import { supabase } from '@/integrations/supabase/client';
import { MessageThreadSummary } from "../types";

/**
 * Fetches a list of message threads for a user, consolidated by other user
 */
export async function fetchMessageThreads(userId: string): Promise<MessageThreadSummary[]> {
  try {
    console.log("Fetching message threads for user:", userId);
    
    if (!userId) {
      console.error('fetchMessageThreads called with empty userId');
      return [];
    }
    
    // Convert userId to lowercase for consistency
    const userIdLower = String(userId).toLowerCase();
    
    // Use explicit select without relying on foreign key relationships for tasks
    const { data: threadsData, error } = await supabase
      .from('messages')
      .select(`
        id,
        task_id,
        sender_id,
        receiver_id, 
        content,
        created_at,
        read
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching message threads:", error);
      throw new Error(`Failed to fetch message threads: ${error.message}`);
    }

    if (!threadsData || threadsData.length === 0) {
      console.log("No message threads found for user:", userId);
      return [];
    }

    console.log(`Found ${threadsData.length} messages for user:`, userId);

    // Get all unique user IDs from the messages (both senders and receivers)
    const userIds = new Set<string>();
    threadsData.forEach(message => {
      userIds.add(String(message.sender_id).toLowerCase());
      userIds.add(String(message.receiver_id).toLowerCase());
    });
    
    // Fetch user profiles for all users in a single query
    const { data: userProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', Array.from(userIds));

    if (profilesError) {
      console.error("Error fetching user profiles:", profilesError);
      throw new Error(`Failed to fetch user profiles: ${profilesError.message}`);
    }

    // Create a map for quick profile lookup, using lowercase keys
    const profilesMap: Record<string, any> = {};
    userProfiles?.forEach(profile => {
      profilesMap[String(profile.id).toLowerCase()] = profile;
    });

    console.log("Fetched profiles for users:", Object.keys(profilesMap).length);

    // Get all unique task IDs
    const taskIds = new Set<string>();
    threadsData.forEach(message => {
      if (message.task_id) {
        taskIds.add(String(message.task_id));
      }
    });

    // Fetch task titles in a separate query
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title')
      .in('id', Array.from(taskIds));

    if (tasksError) {
      console.error("Error fetching task details:", tasksError);
      throw new Error(`Failed to fetch task details: ${tasksError.message}`);
    }

    // Create a map for quick task lookup
    const tasksMap: Record<string, any> = {};
    tasksData?.forEach(task => {
      tasksMap[String(task.id)] = task;
    });

    // Group messages by conversation partner
    const conversationMap: Record<string, any[]> = {};

    threadsData.forEach(message => {
      // Determine the other user involved in the conversation
      // Normalize both IDs to lowercase for comparison
      const messageSenderId = String(message.sender_id).toLowerCase();
      const messageReceiverId = String(message.receiver_id).toLowerCase();
      
      const otherUserId = messageSenderId === userIdLower 
        ? message.receiver_id 
        : message.sender_id;
      
      // Normalize the otherUserId for use as the key
      const otherUserIdLower = String(otherUserId).toLowerCase();
      
      // Create a key for the conversation if it doesn't exist
      if (!conversationMap[otherUserIdLower]) {
        conversationMap[otherUserIdLower] = [];
      }
      
      conversationMap[otherUserIdLower].push(message);
    });
    
    // Create thread summaries from the grouped conversations
    const threads: MessageThreadSummary[] = [];
    
    for (const [otherUserId, messages] of Object.entries(conversationMap)) {
      // Sort messages to get the latest first
      messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Get the most recent message
      const latestMessage = messages[0];
      
      // Normalize IDs for comparison
      const latestMessageSenderId = String(latestMessage.sender_id).toLowerCase();
      
      // Determine if the other user is the sender of the latest message
      const isOtherUserSender = latestMessageSenderId !== userIdLower;
      
      // Get profile info from our profiles map
      const otherUserProfile = profilesMap[otherUserId];
      
      // Count unread messages from the other user
      const unreadCount = messages.filter(msg => 
        String(msg.sender_id).toLowerCase() !== userIdLower && !msg.read
      ).length;
      
      // Get task info from our tasks map
      const taskInfo = tasksMap[latestMessage.task_id];
      
      // Create thread summary
      const thread: MessageThreadSummary = {
        task_id: latestMessage.task_id,
        task_title: taskInfo?.title || "Unknown Task",
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
