
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

    console.log("First query successful - Task exists:", taskData.id);

    // First try: Get all offers for this task
    const { data: offersData, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .eq('task_id', taskId);

    // Log raw offers data to see what we're working with
    console.log("Raw offers data (no joins):", offersData);

    if (offersError) {
      console.error("Error fetching basic offers:", offersError);
      throw new Error(`Failed to fetch basic offers: ${offersError.message}`);
    }
    
    // Then perform a separate query to get provider details
    const providerIds = offersData?.map(offer => offer.provider_id) || [];
    console.log("Provider IDs extracted:", providerIds);

    // If we have no offers, return early
    if (providerIds.length === 0) {
      console.log("No offers found for task:", taskId);
      return [];
    }

    // Get provider profiles in a separate query
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', providerIds);

    console.log("Profiles data:", profilesData);

    if (profilesError) {
      console.error("Error fetching provider profiles:", profilesError);
      // Continue anyway, we can still show offers without profile details
    }

    // Create a map of profiles for easy lookup - using Map() for better key handling
    const profileMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        // Standardize IDs to lowercase strings
        const profileId = String(profile.id).toLowerCase();
        profileMap.set(profileId, profile);
        console.log(`Added profile to map: ${profileId} -> ${profile.full_name || 'No name'}`);
      });
    }
    
    console.log("Profile map created with entries:", profileMap.size);
    console.log("Profile map keys:", Array.from(profileMap.keys()));
    
    // Transform the data into the expected Offer format
    const offers: Offer[] = offersData.map((offer) => {
      // Look up the profile from our map - using lowercase for consistent lookup
      const providerIdLower = String(offer.provider_id).toLowerCase();
      const profile = profileMap.get(providerIdLower);
      console.log(`Processing offer ${offer.id} for provider ${offer.provider_id} (lowercase: ${providerIdLower}):`, profile || 'Profile not found');
      
      // Set a meaningful provider name with fallbacks
      let providerName = "Unknown Provider";
      if (profile && profile.full_name) {
        providerName = profile.full_name;
      } else if (offer.provider_id) {
        providerName = `Provider ${offer.provider_id.substring(0, 8)}`;
      }
      
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
          avatar_url: profile?.avatar_url || undefined,
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
