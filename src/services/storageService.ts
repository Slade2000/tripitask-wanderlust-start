
import { supabase } from '@/integrations/supabase/client';

export async function createBucketIfNotExists(bucketName: string) {
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
        console.error('Error creating bucket:', error);
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

// Initialize storage buckets when the app starts
export async function initializeStorage() {
  try {
    await createBucketIfNotExists('task-photos');
    console.log('Storage buckets initialized');
  } catch (error) {
    console.error('Failed to initialize storage buckets:', error);
  }
}
