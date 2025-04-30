
import { supabase } from '@/integrations/supabase/client';

export interface TaskData {
  title: string;
  description?: string;
  budget?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  dueDate?: Date;
  photos?: File[];
}

export async function createTask(taskData: TaskData) {
  try {
    // 1. First create the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        description: taskData.description,
        budget: taskData.budget ? parseFloat(taskData.budget) : null,
        location: taskData.location,
        latitude: taskData.latitude,
        longitude: taskData.longitude,
        due_date: taskData.dueDate,
        creator_id: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (taskError) {
      throw taskError;
    }

    // 2. If there are photos, upload them to storage and create records
    if (taskData.photos && taskData.photos.length > 0) {
      // Create a storage folder for this task's photos
      const taskId = task.id;
      const photoPromises = taskData.photos.map(async (photo, index) => {
        const fileExt = photo.name.split('.').pop();
        const filePath = `task-photos/${taskId}/${index}-${Date.now()}.${fileExt}`;
        
        // Upload the photo to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('task-photos')
          .upload(filePath, photo);
          
        if (uploadError) {
          console.error('Error uploading photo:', uploadError);
          return null;
        }
        
        // Get the public URL
        const { data: publicUrl } = supabase.storage
          .from('task-photos')
          .getPublicUrl(filePath);
          
        // Create a record in the task_photos table
        const { error: photoError } = await supabase
          .from('task_photos')
          .insert({
            task_id: taskId,
            photo_url: publicUrl.publicUrl
          });
          
        if (photoError) {
          console.error('Error creating photo record:', photoError);
          return null;
        }
        
        return publicUrl.publicUrl;
      });
      
      await Promise.all(photoPromises);
    }

    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function getUserTasks() {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_photos (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    throw error;
  }
}
