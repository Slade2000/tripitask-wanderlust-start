
import { supabase } from "@/integrations/supabase/client";
import { Message } from "../types";
import { fetchMessageAttachments, transformMessagesToDto } from "../helpers/messageHelpers";

/**
 * Fetches all messages between two users, regardless of task
 */
export async function fetchMessages(userId: string, otherId: string, taskId?: string): Promise<Message[]> {
  try {
    console.log(`Fetching all messages between users: ${userId} and ${otherId}`);
    
    // Build the query to get messages between the two users
    let query = supabase
      .from('messages')
      .select(`
        *
      `)
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    
    // If taskId is provided, filter by task
    if (taskId) {
      query = query.eq('task_id', taskId);
    }
    
    // Execute the query
    const { data: messagesData, error: messagesError } = await query;
    
    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw new Error(`Failed to fetch messages: ${messagesError.message}`);
    }

    console.log(`Found ${messagesData?.length || 0} messages between users ${userId} and ${otherId}`);

    if (!messagesData || messagesData.length === 0) {
      console.log("No messages found");
      return [];
    }

    // Get all unique user IDs from the messages (both senders and receivers)
    const userIds = new Set<string>();
    messagesData.forEach(message => {
      userIds.add(String(message.sender_id));
      userIds.add(String(message.receiver_id));
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

    // Create a map for quick profile lookup
    const profilesMap: Record<string, any> = {};
    userProfiles?.forEach(profile => {
      profilesMap[String(profile.id)] = profile;
    });

    // Extract message IDs to fetch attachments
    const messageIds = messagesData.map(message => message.id);
    
    // Fetch message attachments for all messages
    const attachmentsByMessageId = await fetchMessageAttachments(messageIds);

    // Add profile information to the message data
    const messagesWithProfiles = messagesData.map(message => {
      const senderProfile = profilesMap[message.sender_id];
      return {
        ...message,
        sender: {
          full_name: senderProfile?.full_name || "Unknown User",
          avatar_url: senderProfile?.avatar_url
        },
        receiver: {
          full_name: profilesMap[message.receiver_id]?.full_name,
          avatar_url: profilesMap[message.receiver_id]?.avatar_url
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
