
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
 * Fetches user profiles for a list of user IDs
 */
export async function fetchUserProfiles(userIds: string[]): Promise<Record<string, any>> {
  if (userIds.length === 0) return {};

  try {
    const { data: profilesData, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (error) {
      console.error("Error fetching profiles:", error);
      return {};
    }

    // Map profiles by ID for easy lookup
    const profilesById: Record<string, any> = {};
    
    profilesData?.forEach(profile => {
      profilesById[profile.id] = profile;
    });

    return profilesById;
  } catch (error) {
    console.error("Error in fetchUserProfiles:", error);
    return {};
  }
}

/**
 * Transforms raw message data into structured Message objects
 */
export function transformMessagesToDto(
  messagesData: any[], 
  attachmentsByMessageId: Record<string, MessageAttachment[]>, 
  profilesById: Record<string, any>
): Message[] {
  return messagesData.map(message => {
    const senderProfile = profilesById[message.sender_id] || {};
    
    return {
      id: message.id,
      task_id: message.task_id,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      content: message.content,
      created_at: message.created_at,
      attachments: attachmentsByMessageId[message.id] || [],
      sender_name: senderProfile.full_name || "Unknown User",
      sender_avatar: senderProfile.avatar_url
    };
  });
}
