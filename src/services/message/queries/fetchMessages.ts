
import { supabase } from "@/integrations/supabase/client";
import { Message } from "../types";
import { fetchMessageAttachments, fetchUserProfiles, transformMessagesToDto } from "../helpers/messageHelpers";

/**
 * Fetches messages between two users for a specific task
 */
export async function fetchMessages(taskId: string, userId: string, otherId: string): Promise<Message[]> {
  try {
    console.log(`Fetching messages for task: ${taskId} between users: ${userId} and ${otherId}`);
    
    // Get messages directly with conditional filters
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select()
      .eq('task_id', taskId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .or(`sender_id.eq.${otherId},receiver_id.eq.${otherId}`)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw messagesError;
    }

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
