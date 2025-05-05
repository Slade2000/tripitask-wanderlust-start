import { supabase } from "@/integrations/supabase/client";

export interface TaskData {
  id?: string;
  title: string;
  description: string;
  budget: string;
  location: string;
  user_id: string;
  due_date: string;
  status?: string;
  category_id: string;
  photos: File[];
  latitude?: number | null;
  longitude?: number | null;
}

export interface TaskFilterParams {
  searchQuery?: string;
  categoryId?: string;
  distanceRadius?: number;
  maxBudget?: number;
  locationName?: string;
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

export async function getTaskById(taskId: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_photos(*),
        categories(name, description)
      `)
      .eq('id', taskId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching task details:", error);
    return null;
  }
}

export async function getTaskOffers(taskId: string) {
  try {
    // This is a mock implementation since we don't have the offers table yet
    // In a real implementation, you would query the offers table for real data
    return [
      {
        id: "offer-1",
        task_id: taskId,
        provider_id: "provider-1",
        amount: 180,
        expected_delivery_date: new Date().toISOString(),
        status: 'pending' as 'pending' | 'accepted' | 'rejected',
        created_at: new Date().toISOString(),
        provider: {
          id: "provider-1",
          name: "John Doe",
          avatar_url: "",
          rating: 4.8,
          success_rate: "92% jobs completed successfully"
        }
      },
      {
        id: "offer-2",
        task_id: taskId,
        provider_id: "provider-2",
        amount: 220,
        expected_delivery_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending' as 'pending' | 'accepted' | 'rejected',
        created_at: new Date().toISOString(),
        provider: {
          id: "provider-2",
          name: "Jane Smith",
          avatar_url: "",
          rating: 4.9,
          success_rate: "95% jobs completed successfully"
        }
      }
    ];
    
    // Later, replace with actual query:
    /*
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        profiles:provider_id(id, full_name, avatar_url)
      `)
      .eq('task_id', taskId);

    if (error) {
      throw error;
    }

    return data;
    */
  } catch (error) {
    console.error("Error fetching task offers:", error);
    return [];
  }
}

export async function getAllAvailableTasks(filters: TaskFilterParams = {}) {
  try {
    // In a real implementation, you would use the filters to query the tasks table
    // For now, we'll return mock data
    
    // Mock tasks data
    const mockTasks = [
      {
        id: "task-1",
        title: "Help moving furniture",
        description: "Need help moving furniture from apartment to new house",
        budget: "120",
        location: "Sydney CBD",
        user_id: "user-1",
        due_date: new Date(Date.now() + 3 * 86400000).toISOString(),
        status: "open",
        category_id: "category-1",
        latitude: -33.8688,
        longitude: 151.2093
      },
      {
        id: "task-2",
        title: "Garden maintenance",
        description: "Regular garden maintenance needed for front and back yard",
        budget: "80",
        location: "Melbourne",
        user_id: "user-2",
        due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: "open",
        category_id: "category-2",
        latitude: -37.8136,
        longitude: 144.9631
      },
      {
        id: "task-3",
        title: "Website development",
        description: "Create a simple portfolio website",
        budget: "500",
        location: "Perth",
        user_id: "user-3",
        due_date: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: "open",
        category_id: "category-3",
        latitude: -31.9505,
        longitude: 115.8605
      },
      {
        id: "task-4",
        title: "Dog walking service",
        description: "Need someone to walk my dog daily for the next week",
        budget: "150",
        location: "Brisbane",
        user_id: "user-4",
        due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
        status: "open",
        category_id: "category-4",
        latitude: -27.4698,
        longitude: 153.0251
      }
    ];
    
    // Apply mock filtering
    let filteredTasks = [...mockTasks];
    
    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query) ||
        task.location.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (filters.categoryId) {
      filteredTasks = filteredTasks.filter(task => task.category_id === filters.categoryId);
    }
    
    // Filter by budget
    if (filters.maxBudget) {
      filteredTasks = filteredTasks.filter(task => parseInt(task.budget) <= filters.maxBudget);
    }
    
    // In a real implementation, you would use the user's current location and calculate distance
    // between the user and each task to filter by distanceRadius
    
    return filteredTasks;
    
    // Later, replace with actual Supabase query:
    /*
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        categories(name)
      `)
      .eq('status', 'open');

    if (error) {
      throw error;
    }

    return data || [];
    */
  } catch (error) {
    console.error("Error fetching available tasks:", error);
    return [];
  }
}
