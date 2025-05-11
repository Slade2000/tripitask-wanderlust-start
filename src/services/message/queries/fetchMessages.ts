
import { supabase } from "@/integrations/supabase/client";
import { Message } from "../types";
import { fetchMessageAttachments, fetchUserProfiles, transformMessagesToDto } from "../helpers/messageHelpers";

/**
 * Fetches messages between two users for a specific task
 */
export async function fetchMessages(taskId: string, userId: string, otherId: string): Promise<Message[]> {
  try {
    console.log(`Fetching messages for task: ${taskId} between users: ${userId} and ${otherId}`);
    
    // Get messages for the specific task between the two users
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select()
      .eq('task_id', taskId)
      .or(`sender_id.eq.${userId},sender_id.eq.${otherId}`)
      .or(`receiver_id.eq.${userId},receiver_id.eq.${otherId}`)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw messagesError;
    }

    // Further filter the messages to only include those between the two users
    const filteredMessages = messagesData?.filter(message => 
      (message.sender_id === userId && message.receiver_id === otherId) || 
      (message.sender_id === otherId && message.receiver_id === userId)
    ) || [];

    console.log(`Found ${filteredMessages.length} messages between users ${userId} and ${otherId} for task ${taskId}`);

    if (!filteredMessages || filteredMessages.length === 0) {
      console.log("No messages found");
      return [];
    }

    // Extract message IDs to fetch attachments
    const messageIds = filteredMessages.map(message => message.id);
    
    // Fetch message attachments for all messages
    const attachmentsByMessageId = await fetchMessageAttachments(messageIds);

    // Get unique user IDs from messages to fetch profiles
    const userIds = Array.from(
      new Set([
        ...filteredMessages.map(message => message.sender_id),
        ...filteredMessages.map(message => message.receiver_id)
      ])
    );

    // Fetch user profiles
    const profilesById = await fetchUserProfiles(userIds);

    // Transform raw message data into DTO objects
    return transformMessagesToDto(filteredMessages, attachmentsByMessageId, profilesById);
  } catch (error) {
    console.error("Error in fetchMessages:", error);
    throw error;
  }
}
