
import { supabase } from "@/integrations/supabase/client";

export async function uploadTaskPhotos(taskId: string, photos: (string | File)[]): Promise<void> {
  try {
    // Filter out string URLs and only process File objects
    const filePhotos = photos.filter((photo): photo is File => photo instanceof File);
    
    // If no File objects to upload, return early
    if (filePhotos.length === 0) {
      return;
    }
    
    // Ensure the bucket exists first to prevent errors
    const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
    if (bucketListError) {
      console.error("Error listing buckets:", bucketListError);
      throw bucketListError;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'task-photos');
    if (!bucketExists) {
      try {
        // Create the bucket if it doesn't exist
        const { error: createBucketError } = await supabase.storage.createBucket('task-photos', {
          public: true
        });
        if (createBucketError) {
          console.error("Error creating bucket:", createBucketError);
          throw createBucketError;
        }
      } catch (e) {
        console.error("Failed to check/create bucket task-photos:", e);
        // Continue anyway - the bucket might exist despite error
      }
    }

    for (const photo of filePhotos) {
      // Upload photo to storage
      const fileName = `${taskId}/${Date.now()}-${photo.name}`;
      const { error: storageError, data: storageData } = await supabase
        .storage
        .from('task-photos')
        .upload(fileName, photo, {
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
        .from('task-photos')
        .getPublicUrl(fileName);

      if (!publicUrl || !publicUrl.publicUrl) {
        throw new Error('Failed to get public URL for uploaded photo');
      }

      // Create task photo entry
      const { error: taskPhotoError } = await supabase
        .from('task_photos')
        .insert({
          task_id: taskId,
          photo_url: publicUrl.publicUrl
        });

      if (taskPhotoError) {
        console.error("Task photo error:", taskPhotoError);
        throw taskPhotoError;
      }
    }
  } catch (error) {
    console.error("Error uploading photos:", error);
    // Don't rethrow the error - we want the task creation to succeed even if photos fail
  }
}
