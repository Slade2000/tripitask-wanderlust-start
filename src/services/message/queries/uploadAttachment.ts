
import { supabase } from "@/integrations/supabase/client";
import { AttachmentType, MessageAttachment } from "../types";

/**
 * Uploads attachment for a message
 */
export async function uploadMessageAttachment(
  messageId: string,
  file: File,
  fileType: AttachmentType
): Promise<MessageAttachment | null> {
  try {
    // Ensure the bucket exists
    await createBucketIfNotExists('message-attachments');

    // Upload file to storage
    const fileName = `${messageId}/${Date.now()}-${file.name}`;
    const { error: storageError, data: storageData } = await supabase
      .storage
      .from('message-attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (storageError) {
      console.error("Storage error:", storageError);
      throw storageError;
    }

    // Get public URL for the uploaded file
    const { data: publicUrl } = supabase
      .storage
      .from('message-attachments')
      .getPublicUrl(fileName);

    if (!publicUrl || !publicUrl.publicUrl) {
      throw new Error('Failed to get public URL for uploaded attachment');
    }

    // Create message attachment entry
    const { data: attachmentData, error: attachmentError } = await supabase
      .from('message_attachments')
      .insert({
        message_id: messageId,
        file_url: publicUrl.publicUrl,
        file_type: fileType
      })
      .select()
      .single();

    if (attachmentError) {
      console.error("Attachment database error:", attachmentError);
      throw attachmentError;
    }

    return attachmentData as MessageAttachment;
  } catch (error) {
    console.error("Error uploading message attachment:", error);
    return null;
  }
}

// Helper function to ensure bucket exists
async function createBucketIfNotExists(bucketName: string) {
  try {
    // Check if the bucket already exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (error) {
        console.error(`Error creating bucket ${bucketName}:`, error);
        throw error;
      }
      console.log(`Bucket ${bucketName} created successfully`);
    } else {
      console.log(`Bucket ${bucketName} already exists`);
    }
  } catch (error) {
    console.error(`Failed to check/create bucket ${bucketName}:`, error);
    throw error;
  }
}
