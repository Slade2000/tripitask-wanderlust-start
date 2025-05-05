
import { supabase } from "@/integrations/supabase/client";
import { TaskData } from "./types";
import { uploadTaskPhotos } from "./taskPhotoUpload";

export async function createTask(taskData: TaskData): Promise<string | null> {
  try {
    // Create task entry
    const { data: taskInsertData, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        description: taskData.description,
        budget: taskData.budget,
        category_id: taskData.category_id,
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
