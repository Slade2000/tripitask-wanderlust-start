
import { supabase } from "@/integrations/supabase/client";
import type { Offer } from "@/types/offer";

/**
 * Fetches all offers for a specific task
 */
export async function getTaskOffers(taskId: string): Promise<Offer[]> {
  try {
    console.log("Fetching offers for task:", taskId);
    
    if (!taskId) {
      console.error("No task ID provided");
      throw new Error("Task ID is required to fetch offers");
    }
    
    // Verify that the task exists
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError) {
      console.error("Error verifying task existence:", taskError);
      throw new Error(`Task verification failed: ${taskError.message}`);
    }

    if (!taskData) {
      console.error("Task not found with ID:", taskId);
      throw new Error("Task not found");
    }

    console.log("Task exists:", taskData);

    // Use a direct join with the profiles table to get provider information in one query
    const { data: offersWithProfiles, error: joinError } = await supabase
      .from('offers')
      .select(`
        *,
        provider:profiles(id, full_name, avatar_url)
      `)
      .eq('task_id', taskId);

    if (joinError) {
      console.error("Error fetching offers with profiles:", joinError);
      throw new Error(`Failed to fetch offers with profiles: ${joinError.message}`);
    }

    console.log("Raw offers with profiles data:", offersWithProfiles);

    if (!offersWithProfiles || offersWithProfiles.length === 0) {
      console.log("No offers found for task:", taskId);
      return [];
    }

    // Transform the offers to match our expected Offer type
    const offers: Offer[] = offersWithProfiles.map(offer => {
      // Extract provider data from the joined profiles
      // Important: Supabase returns this as an array, we need to get the first item
      const providerProfile = offer.provider?.[0] || null;
      console.log(`Provider profile for offer ${offer.id}:`, providerProfile);

      // Create the provider object with actual data
      const provider = {
        id: offer.provider_id,
        name: providerProfile?.full_name || '', // Use full_name directly from the provider profile
        avatar_url: providerProfile?.avatar_url || '',
        rating: 4.5, // Placeholder rating
        success_rate: "95%" // Placeholder success rate
      };
      
      console.log(`Final provider data for offer ${offer.id}:`, provider);
      
      return {
        id: offer.id,
        task_id: offer.task_id,
        provider_id: offer.provider_id,
        amount: offer.amount,
        expected_delivery_date: offer.expected_delivery_date,
        message: offer.message || undefined,
        status: offer.status as 'pending' | 'accepted' | 'rejected',
        created_at: offer.created_at,
        provider
      };
    });

    console.log("Transformed offers with provider data:", offers);
    return offers;
  } catch (error) {
    console.error("Error in getTaskOffers:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while fetching offers");
    }
  }
}
