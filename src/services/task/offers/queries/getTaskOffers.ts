
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

    // First, get all offers for the task
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

    // Extract all provider IDs from the offers
    const providerIds = offersData.map(offer => offer.provider_id).filter(Boolean);
    console.log("Provider IDs found:", providerIds);

    // Fetch provider profiles separately if there are any provider IDs
    let providerProfiles: Record<string, any> = {};
    
    if (providerIds.length > 0) {
      try {
        // Try to get profiles from the profiles table with exact fields we need
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', providerIds);
        
        if (profilesError) {
          console.error("Error fetching provider profiles:", profilesError);
        } else if (profilesData && profilesData.length > 0) {
          console.log("Provider profiles fetched successfully:", profilesData);
          
          // Create a normalized map of profiles by ID for easy lookup (case-insensitive)
          providerProfiles = profilesData.reduce((acc, profile) => {
            // Store with lowercase key for case-insensitive lookup
            const normalizedId = profile.id.toLowerCase();
            acc[normalizedId] = {
              id: profile.id,
              // Use full_name or default to shortened id
              name: profile.full_name || `Provider ${profile.id.substring(0, 8)}`,
              avatar_url: profile.avatar_url || '',
            };
            console.log(`Added profile to map: ${normalizedId} = ${profile.full_name || 'unnamed'}`);
            return acc;
          }, {} as Record<string, any>);
          
          console.log("Provider profiles map created:", providerProfiles);
        } else {
          console.log("No provider profiles found in profiles table");
        }
      } catch (profileError) {
        console.error("Error in profile fetching:", profileError);
      }
    }

    // Transform offers with provider data
    const offers: Offer[] = offersData.map(offer => {
      // Make the provider ID lookup case insensitive
      const providerId = offer.provider_id ? offer.provider_id.toLowerCase() : '';
      
      // Look up the provider data from our map
      const providerData = providerId ? providerProfiles[providerId] : null;
      
      console.log(`Processing offer ${offer.id}, provider ID: ${offer.provider_id}`);
      console.log(`Provider data found:`, providerData);
      
      // Create the provider object with actual data or fallbacks
      const provider = {
        id: offer.provider_id,
        name: providerData?.name || `Provider ${offer.provider_id.substring(0, 8)}`,
        avatar_url: providerData?.avatar_url || '',
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
