
import { supabase } from "@/integrations/supabase/client";
import type { Offer } from "@/types/offer";
import type { Database } from "@/types/supabase";

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

    // Fetch offers with provider profiles in a single join query
    // This is more efficient than separate queries
    const { data: offersWithProfiles, error: offersError } = await supabase
      .from('offers')
      .select(`
        *,
        profiles:provider_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('task_id', taskId);

    if (offersError) {
      console.error("Error fetching offers with profiles:", offersError);
      throw new Error(`Failed to fetch offers: ${offersError.message}`);
    }

    console.log("Raw offers with profiles data:", offersWithProfiles);

    if (!offersWithProfiles || offersWithProfiles.length === 0) {
      console.log("No offers found for task:", taskId);
      return [];
    }
    
    // Transform the offers with provider details included
    const offers: Offer[] = offersWithProfiles.map((offer: any) => {
      // Extract profile data from the joined query
      const profileData = offer.profiles || {};
      
      // Determine the best name to display for the provider
      let providerName = "Unknown Provider";
      
      // Use full_name if available
      if (profileData.full_name) {
        providerName = profileData.full_name;
      } else {
        // Use a clean fallback if no name is available
        providerName = `Provider ${offer.provider_id.substring(0, 4)}`;
      }
      
      console.log(`Provider ${offer.provider_id} final display name: ${providerName}`);
      
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
          avatar_url: profileData.avatar_url || undefined,
          rating: 4.5, // Placeholder rating
          success_rate: "95%" // Placeholder success rate
        }
      };
    });

    console.log("Transformed offers with provider details:", offers);
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
