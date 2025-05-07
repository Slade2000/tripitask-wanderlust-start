
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
      // Try to get profiles from the profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', providerIds);
      
      if (profilesError) {
        console.error("Error fetching provider profiles:", profilesError);
      } else if (profilesData && profilesData.length > 0) {
        // Create a map of profiles by ID for easy lookup
        providerProfiles = profilesData.reduce((acc, profile) => {
          acc[profile.id.toLowerCase()] = profile;
          console.log(`Added profile to map: ${profile.id.toLowerCase()} = ${profile.full_name}`);
          return acc;
        }, {} as Record<string, any>);
        console.log("Provider profiles fetched:", profilesData.length);
        console.log("Provider profiles map:", providerProfiles);
      } else {
        console.log("No provider profiles found in profiles table");
      }
    }

    // Transform offers with provider data and add dummy data if provider not found
    const offers: Offer[] = offersData.map(offer => {
      // Make the lookup case insensitive
      const providerId = offer.provider_id ? offer.provider_id.toLowerCase() : '';
      const providerData = providerId ? providerProfiles[providerId] : null;
      
      console.log(`Processing offer ${offer.id}, provider ID: ${offer.provider_id}`);
      console.log(`Looking up provider with ID (lowercase): ${providerId}`);
      console.log(`Provider data found:`, providerData);
      
      let providerName;
      
      if (providerData && providerData.full_name) {
        providerName = providerData.full_name;
        console.log(`Using profile full_name: ${providerName}`);
      } else {
        providerName = `Provider #${offer.provider_id.substring(0, 8)}`;
        console.log(`Using fallback provider name: ${providerName}`);
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
          id: offer.provider_id || '',
          name: providerName,
          avatar_url: providerData?.avatar_url || '',
          rating: 4.5, // Placeholder rating
          success_rate: "95%" // Placeholder success rate
        }
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
