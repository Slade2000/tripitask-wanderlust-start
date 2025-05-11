
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

    // Use explicit join syntax for better control and clarity
    const { data, error } = await supabase
      .from('offers')
      .select(`
        id,
        task_id,
        provider_id,
        amount,
        expected_delivery_date,
        message,
        status,
        created_at,
        profiles:provider_id (id, full_name, avatar_url)
      `)
      .eq('task_id', taskId);

    if (error) {
      console.error("Error fetching offers:", error);
      throw new Error(`Failed to fetch offers: ${error.message}`);
    }

    // Log the raw data for debugging
    console.log("Raw offers data:", data);

    if (!data || data.length === 0) {
      console.log("No offers found for task:", taskId);
      return [];
    }
    
    // Transform the data into the expected Offer format
    const offers: Offer[] = data.map((offer) => {
      // Get profile data safely
      const profile = offer.profiles || {};
      
      // Set a meaningful provider name with fallbacks
      let providerName = "Unknown Provider";
      if (profile && profile.full_name) {
        providerName = profile.full_name;
      } else if (offer.provider_id) {
        providerName = `Provider ${offer.provider_id.substring(0, 8)}`;
      }
      
      console.log(`Provider ${offer.provider_id} display name: ${providerName}`, profile);
      
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
          name: providerName,
          avatar_url: profile.avatar_url || undefined,
          rating: 4.5, // Placeholder rating
          success_rate: "95%" // Placeholder success rate
        }
      };
    });

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
