
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageAttachment } from "../types";

/**
 * Fetches messages between two users for a specific task
 */
export async function getMessages(taskId: string, userId: string, otherId: string): Promise<Message[]> {
  try {
    console.log(`Fetching messages for task: ${taskId} between users: ${userId} and ${otherId}`);
    
    // Get messages directly with conditional filters
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
    let attachmentsData: any[] = [];
    
    // Fetch message attachments if there are any messages
    if (messageIds.length > 0) {
      const { data, error: attachmentsError } = await supabase
        .from('message_attachments')
        .select('*')
        .in('message_id', messageIds);
      
      if (attachmentsError) {
        console.error("Error fetching message attachments:", attachmentsError);
      } else if (data) {
        attachmentsData = data;
      }
    }

    // Group attachments by message_id
    const attachmentsByMessageId: Record<string, MessageAttachment[]> = {};
    attachmentsData.forEach(attachment => {
      if (!attachmentsByMessageId[attachment.message_id]) {
        attachmentsByMessageId[attachment.message_id] = [];
      }
      attachmentsByMessageId[attachment.message_id].push({
        id: attachment.id,
        message_id: attachment.message_id,
        file_url: attachment.file_url,
        file_type: attachment.file_type,
        created_at: attachment.created_at
      });
    });

    // Get unique user IDs from messages to fetch profiles
    const userIds = Array.from(
      new Set([
        ...messagesData.map(message => message.sender_id),
        ...messagesData.map(message => message.receiver_id)
      ])
    );

    // Fetch user profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Map profiles by ID for easy lookup
    const profilesById: Record<string, any> = {};
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesById[profile.id] = profile;
      });
    }

    // Combine messages with their attachments and sender details
    const messages: Message[] = messagesData.map(message => {
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
    // This gets messages where the current user is either sender or receiver
    const { data: userMessages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error("Error fetching message threads:", messagesError);
      throw messagesError;
    }

    if (!userMessages || userMessages.length === 0) {
      return [];
    }

    // Get all task IDs from messages to fetch task details
    const taskIds = [...new Set(userMessages.map(msg => msg.task_id))];
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title')
      .in('id', taskIds);

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
    }

    // Map tasks by ID for easy lookup
    const tasksById: Record<string, any> = {};
    if (tasksData) {
      tasksData.forEach(task => {
        tasksById[task.id] = task;
      });
    }

    // Create a map to track unique thread combinations (taskId + otherUserId)
    const threadMap = new Map();
    
    // Process messages to create thread summaries
    userMessages.forEach(message => {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      const threadKey = `${message.task_id}-${otherUserId}`;
      
      // Only add this message if it's more recent than what we already have
      if (!threadMap.has(threadKey) || 
          new Date(message.created_at) > new Date(threadMap.get(threadKey).last_message_date)) {
        threadMap.set(threadKey, {
          task_id: message.task_id,
          task_title: (tasksById[message.task_id] && tasksById[message.task_id].title) || "Unknown Task",
          last_message_content: message.content,
          last_message_date: message.created_at,
          unread_count: 0, // Would need a read_receipts table to track this
          other_user_id: otherUserId,
          other_user_name: "Loading...", // Will be filled in later
          other_user_avatar: undefined
        });
      }
    });

    // Get all the other user IDs to fetch their profiles
    const otherUserIds = Array.from(threadMap.values()).map(thread => thread.other_user_id);
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', otherUserIds);

    if (profilesError) {
      console.error("Error fetching user profiles:", profilesError);
    }

    // Map profiles by ID
    const profilesById: Record<string, any> = {};
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesById[profile.id] = profile;
      });
    }

    // Update thread summaries with user details
    const threads = Array.from(threadMap.values()).map(thread => {
      const profile = profilesById[thread.other_user_id] || {};
      return {
        ...thread,
        other_user_name: profile.full_name || "Unknown User",
        other_user_avatar: profile.avatar_url
      };
    });

    return threads;
  } catch (error) {
    console.error("Error in getMessageThreads:", error);
    throw error;
  }
}
