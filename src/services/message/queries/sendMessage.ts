
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageAttachment } from "../types";
import { uploadMessageAttachment } from "./uploadAttachment";

/**
 * Sends a new message
 */
export async function sendMessage(
  message: Omit<Message, 'id' | 'created_at'>,
  files?: File[]
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { success: false, error: "User not authenticated" };
    }

    // Insert the message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert({
        task_id: message.task_id,
        sender_id: userData.user.id,
        receiver_id: message.receiver_id,
        content: message.content
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error sending message:", messageError);
      return { success: false, error: messageError.message };
    }

    const messageId = messageData.id;

    // Upload attachments if any
    if (files && files.length > 0) {
      const attachmentPromises = files.map(file => {
        const fileType = file.type.startsWith('image/') ? 'image' : 
                         file.type.startsWith('video/') ? 'video' : null;
        
        if (!fileType) {
          console.warn(`Unsupported file type: ${file.type}`);
          return null;
        }
        
        return uploadMessageAttachment(messageId, file, fileType as 'image' | 'video');
      });

      // Wait for all attachments to be uploaded
      await Promise.all(attachmentPromises.filter(Boolean));
    }

    return { success: true, message_id: messageId };
  } catch (error: any) {
    console.error("Error in sendMessage:", error);
    return { success: false, error: error.message };
  }
}
