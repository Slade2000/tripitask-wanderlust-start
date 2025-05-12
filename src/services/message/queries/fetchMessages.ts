
import { supabase } from '@/integrations/supabase/client';
import { Message } from "../types";
import { fetchMessageAttachments, transformMessagesToDto } from "../helpers/messageHelpers";

/**
 * Fetches all messages between two users, regardless of task
 */
export async function fetchMessages(userId: string, otherId: string, taskId?: string): Promise<Message[]> {
  try {
    console.log(`Fetching all messages between users: ${userId} and ${otherId}`);
    
    if (!userId || !otherId) {
      console.error('fetchMessages called with invalid parameters:', { userId, otherId });
      return [];
    }
    
    // Normalize user IDs to lowercase to ensure consistent comparisons
    const userIdLower = String(userId).toLowerCase();
    const otherIdLower = String(otherId).toLowerCase();
    
    // Verify we have a valid session before proceeding
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      console.error("No active session found when fetching messages");
      throw new Error("Authentication required");
    }
    
    console.log("Session verified, user authenticated. Querying with IDs:", 
      { userIdLower, otherIdLower });
      
    // Log the SQL filter conditions we're trying to build for debugging
    console.log("Building query to fetch messages where:");
    console.log(`1. (sender_id = '${userIdLower}' AND receiver_id = '${otherIdLower}') OR`);
    console.log(`2. (sender_id = '${otherIdLower}' AND receiver_id = '${userIdLower}')`);
    
    // Build the query to get messages between the two users
    let query = supabase
      .from('messages')
      .select(`*`)
      // Properly filter for messages between these two users using a filter() approach
      .filter('sender_id', 'eq', userIdLower)
      .filter('receiver_id', 'eq', otherIdLower)
      .order('created_at', { ascending: true });
    
    // Now add the messages going the other direction with a separate query
    const query2 = supabase
      .from('messages')
      .select(`*`)
      .filter('sender_id', 'eq', otherIdLower)
      .filter('receiver_id', 'eq', userIdLower)
      .order('created_at', { ascending: true });
    
    // If taskId is provided, filter by task
    if (taskId) {
      query = query.eq('task_id', taskId);
    }
    
    // Execute the first query
    const { data: messagesData1, error: messagesError1 } = await query;
    
    if (messagesError1) {
      console.error("Error fetching messages (first direction):", messagesError1);
      throw new Error(`Failed to fetch messages: ${messagesError1.message}`);
    }
    
    // Execute the second query
    const { data: messagesData2, error: messagesError2 } = await query2;
    
    if (messagesError2) {
      console.error("Error fetching messages (second direction):", messagesError2);
      throw new Error(`Failed to fetch messages: ${messagesError2.message}`);
    }
    
    // Combine the results
    const messagesData = [...(messagesData1 || []), ...(messagesData2 || [])];
    
    // Sort messages by timestamp
    messagesData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    console.log(`Found ${messagesData?.length || 0} messages between users ${userId} and ${otherId}`);

    if (!messagesData || messagesData.length === 0) {
      console.log("No messages found");
      return [];
    }

    // Get all unique user IDs from the messages (both senders and receivers)
    const userIds = new Set<string>();
    messagesData.forEach(message => {
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

    // Create a map for quick profile lookup, normalizing IDs to lowercase
    const profilesMap: Record<string, any> = {};
    userProfiles?.forEach(profile => {
      profilesMap[String(profile.id).toLowerCase()] = profile;
    });

    console.log("Fetched user profiles:", userProfiles?.length || 0);
    
    // Extract message IDs to fetch attachments
    const messageIds = messagesData.map(message => message.id);
    
    // Fetch message attachments for all messages
    const attachmentsByMessageId = await fetchMessageAttachments(messageIds);

    // Add profile information to the message data
    const messagesWithProfiles = messagesData.map(message => {
      // Normalize IDs for lookups
      const senderIdLower = String(message.sender_id).toLowerCase();
      const receiverIdLower = String(message.receiver_id).toLowerCase();
      
      const senderProfile = profilesMap[senderIdLower];
      
      return {
        ...message,
        sender: {
          full_name: senderProfile?.full_name || "Unknown User",
          avatar_url: senderProfile?.avatar_url
        },
        receiver: {
          full_name: profilesMap[receiverIdLower]?.full_name || "Unknown User",
          avatar_url: profilesMap[receiverIdLower]?.avatar_url
        }
      };
    });

    // Transform raw message data into DTO objects
    return transformMessagesToDto(messagesWithProfiles, attachmentsByMessageId);
  } catch (error) {
    console.error("Error in fetchMessages:", error);
    throw new Error(`Failed to load messages: ${error instanceof Error ? error.message : String(error)}`);
  }
}
