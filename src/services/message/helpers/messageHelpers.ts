
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageAttachment } from "../types";

/**
 * Fetches attachments for a list of messages
 */
export async function fetchMessageAttachments(messageIds: string[]): Promise<Record<string, MessageAttachment[]>> {
  if (messageIds.length === 0) return {};

  try {
    const { data: attachmentsData, error } = await supabase
      .from('message_attachments')
      .select('*')
      .in('message_id', messageIds);
    
    if (error) {
      console.error("Error fetching message attachments:", error);
      return {};
    }

    // Group attachments by message_id
    const attachmentsByMessageId: Record<string, MessageAttachment[]> = {};
    
    attachmentsData?.forEach(attachment => {
      if (!attachmentsByMessageId[attachment.message_id]) {
        attachmentsByMessageId[attachment.message_id] = [];
      }
      
      attachmentsByMessageId[attachment.message_id].push({
        id: attachment.id,
        message_id: attachment.message_id,
        file_url: attachment.file_url,
        file_type: attachment.file_type as 'image' | 'video',
        created_at: attachment.created_at
      });
    });

    return attachmentsByMessageId;
  } catch (error) {
    console.error("Error in fetchMessageAttachments:", error);
    return {};
  }
}

/**
 * Transforms raw message data into structured Message objects
 */
export function transformMessagesToDto(
  messagesData: any[], 
  attachmentsByMessageId: Record<string, MessageAttachment[]>
): Message[] {
  return messagesData.map(message => {
    return {
      id: message.id,
      task_id: message.task_id,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      content: message.content,
      created_at: message.created_at,
      attachments: attachmentsByMessageId[message.id] || [],
      sender_name: message.sender?.full_name || "Unknown User",
      sender_avatar: message.sender?.avatar_url
    };
  });
}
