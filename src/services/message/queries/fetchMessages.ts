
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
    // Use Supabase's foreign key references for automatic joins
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (full_name, avatar_url),
        receiver:receiver_id (full_name, avatar_url),
        task:task_id (title)
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

    // Extract message IDs to fetch attachments
    const messageIds = messagesData.map(message => message.id);
    
    // Fetch message attachments for all messages
    const attachmentsByMessageId = await fetchMessageAttachments(messageIds);

    // Transform raw message data into DTO objects
    return transformMessagesToDto(messagesData, attachmentsByMessageId);
  } catch (error) {
    console.error("Error in fetchMessages:", error);
    throw new Error(`Failed to load messages: ${error instanceof Error ? error.message : String(error)}`);
  }
}
