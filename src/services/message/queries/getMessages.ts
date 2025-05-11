
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageAttachment } from "../types";

/**
 * Fetches messages between two users for a specific task
 */
export async function getMessages(taskId: string, userId: string, otherId: string): Promise<Message[]> {
  try {
    console.log(`Fetching messages for task: ${taskId} between users: ${userId} and ${otherId}`);
    
    // Get messages
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
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

    // Get attachments for these messages
    const { data: attachmentsData, error: attachmentsError } = await supabase
      .from('message_attachments')
      .select('*')
      .in('message_id', messageIds);

    if (attachmentsError) {
      console.error("Error fetching message attachments:", attachmentsError);
      // Continue anyway, we can still show messages without attachments
    }

    // Group attachments by message_id
    const attachmentsByMessageId: Record<string, MessageAttachment[]> = {};
    if (attachmentsData) {
      attachmentsData.forEach(attachment => {
        if (!attachmentsByMessageId[attachment.message_id]) {
          attachmentsByMessageId[attachment.message_id] = [];
        }
        attachmentsByMessageId[attachment.message_id].push(attachment as MessageAttachment);
      });
    }

    // Get sender profiles to display names and avatars
    const userIds = Array.from(
      new Set(messagesData.map(message => message.sender_id))
    );

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      // Continue anyway, we can still show messages without sender details
    }

    // Map profiles by ID for easy lookup
    const profilesById: Record<string, any> = {};
    if (profiles) {
      profiles.forEach(profile => {
        profilesById[profile.id] = profile;
      });
    }

    // Combine messages with their attachments and sender details
    const messages = messagesData.map(message => {
      const profile = profilesById[message.sender_id] || {};
      
      return {
        ...message,
        attachments: attachmentsByMessageId[message.id] || [],
        sender_name: profile.full_name || "Unknown User",
        sender_avatar: profile.avatar_url
      } as Message;
    });

    return messages;
  } catch (error) {
    console.error("Error in getMessages:", error);
    throw error;
  }
}

/**
 * Fetches a list of message threads for a user
 */
export async function getMessageThreads(userId: string) {
  try {
    // This is a complex query that would be better suited for a PostgreSQL function
    // Here's a simplified approach that gets the latest message for each task-user pair
    const { data: latestMessages, error } = await supabase
      .from('messages')
      .select(`
        *,
        tasks!messages_task_id_fkey(
          id,
          title
        )
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching message threads:", error);
      throw error;
    }

    // Transform the data to create thread summaries
    // In a real app, you'd use a more efficient approach, possibly using SQL window functions
    const threads = new Map();
    
    await Promise.all(latestMessages?.map(async (message: any) => {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      const taskId = message.task_id;
      const threadKey = `${taskId}-${otherUserId}`;
      
      if (!threads.has(threadKey)) {
        // Get user details
        const { data: otherUserData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUserId)
          .single();

        threads.set(threadKey, {
          task_id: taskId,
          task_title: message.tasks?.title || "Unknown Task",
          last_message_content: message.content,
          last_message_date: message.created_at,
          unread_count: 0, // This would need to be calculated from a read_receipts table
          other_user_id: otherUserId,
          other_user_name: otherUserData?.full_name || "Unknown User",
          other_user_avatar: otherUserData?.avatar_url
        });
      }
    }) || []);
    
    return Array.from(threads.values());
  } catch (error) {
    console.error("Error in getMessageThreads:", error);
    throw error;
  }
}
