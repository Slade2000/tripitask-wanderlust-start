
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

    // Step 1: Get all offers for the task
    const { data: offersData, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .eq('task_id', taskId);

    if (offersError) {
      console.error("Error fetching offers:", offersError);
      throw new Error(`Failed to fetch offers: ${offersError.message}`);
    }

    console.log("Raw offers data:", offersData);

    if (!offersData || offersData.length === 0) {
      console.log("No offers found for task:", taskId);
      return [];
    }

    // Step 2: For each offer, get the provider information
    const offers: Offer[] = await Promise.all(offersData.map(async (offer) => {
      console.log(`Fetching provider info for offer ${offer.id}, provider_id: ${offer.provider_id}`);
      
      const { data: providerData, error: providerError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', offer.provider_id)
        .single();
      
      if (providerError) {
        console.error(`Error fetching provider ${offer.provider_id}:`, providerError);
        // Continue with what we have - don't fail the entire request for one provider
      }

      console.log(`Provider data for offer ${offer.id}:`, providerData);
      
      return {
        id: offer.id,
        task_id: offer.task_id,
        provider_id: offer.provider_id,
        amount: offer.amount,
        expected_delivery_date: offer.expected_delivery_date,
        message: offer.message || undefined,
        status: offer.status as 'pending' | 'accepted' | 'rejected',
        created_at: offer.created_at,
        provider: {
          id: offer.provider_id,
          name: providerData?.full_name || 'Unknown Provider',
          avatar_url: providerData?.avatar_url || '',
          rating: 4.5, // Placeholder rating
          success_rate: "95%" // Placeholder success rate
        }
      };
    }));

    console.log("Transformed offers:", offers);
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
