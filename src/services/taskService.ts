
import { supabase } from "@/integrations/supabase/client";

export interface TaskData {
  id?: string;
  title: string;
  description: string;
  budget: string;
  location: string;
  created_at?: string;
  user_id: string;
  due_date: string;
  status?: string;
  latitude?: number | null;
  longitude?: number | null;
  photos?: File[];
}

export async function createTask(taskData: TaskData): Promise<string | null> {
  try {
    // Create task entry
    const { data: taskInsertData, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        description: taskData.description,
        budget: taskData.budget,
        location: taskData.location,
        user_id: taskData.user_id,
        due_date: taskData.due_date,
        status: 'open',
        latitude: taskData.latitude,
        longitude: taskData.longitude
      })
      .select()
      .single();

    if (taskError) {
      throw taskError;
    }

    if (!taskInsertData || !taskInsertData.id) {
      throw new Error("Failed to get task ID after creation");
    }

    const taskId = taskInsertData.id;

    // Handle photos if provided
    if (taskData.photos && taskData.photos.length > 0) {
      await uploadTaskPhotos(taskId, taskData.photos);
    }

    return taskId;
  } catch (error) {
    console.error("Error creating task:", error);
    return null;
  }
}

export async function uploadTaskPhotos(taskId: string, photos: File[]): Promise<void> {
  try {
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

    for (const photo of photos) {
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

export async function getUserTasks(userId: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_photos(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return [];
  }
}
