
import { supabase } from "@/integrations/supabase/client";
import { Message } from "../types";
import { fetchMessageAttachments, fetchUserProfiles, transformMessagesToDto } from "../helpers/messageHelpers";

/**
 * Fetches all messages between two users, regardless of task
 */
export async function fetchMessages(userId: string, otherId: string, taskId?: string): Promise<Message[]> {
  try {
    console.log(`Fetching all messages between users: ${userId} and ${otherId}`);
    
    // Build the query to get messages between the two users
    let query = supabase
      .from('messages')
      .select()
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
      throw messagesError;
    }

    console.log(`Found ${messagesData?.length || 0} messages between users ${userId} and ${otherId}`);

    if (!messagesData || messagesData.length === 0) {
      console.log("No messages found");
      return [];
    }

    // Extract message IDs to fetch attachments
    const messageIds = messagesData.map(message => message.id);
    
    // Fetch message attachments for all messages
    const attachmentsByMessageId = await fetchMessageAttachments(messageIds);

    // Get unique user IDs from messages to fetch profiles
    const userIds = Array.from(
      new Set([
        ...messagesData.map(message => message.sender_id),
        ...messagesData.map(message => message.receiver_id)
      ])
    );

    // Fetch user profiles
    const profilesById = await fetchUserProfiles(userIds);

    // Transform raw message data into DTO objects
    return transformMessagesToDto(messagesData, attachmentsByMessageId, profilesById);
  } catch (error) {
    console.error("Error in fetchMessages:", error);
    throw error;
  }
}
