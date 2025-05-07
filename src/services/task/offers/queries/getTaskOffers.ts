
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
    let providerProfiles = {};
    
    if (providerIds.length > 0) {
      // Using a different approach to get profiles from the 'users' table
      // This assumes provider_id is a user ID that's in the auth.users table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('id', providerIds);
      
      if (usersError) {
        console.error("Error fetching users data:", usersError);
        // Try profiles table as fallback
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', providerIds);
  
        if (profilesError) {
          console.error("Error fetching provider profiles:", profilesError);
        } else if (profilesData) {
          // Create a map of profiles by ID for easy lookup
          providerProfiles = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
          console.log("Provider profiles fetched from profiles table:", profilesData.length);
        }
      } else if (usersData) {
        // Create a map of users by ID for easy lookup
        providerProfiles = usersData.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        console.log("Provider profiles fetched from users table:", usersData.length);
      }
      
      // If we still don't have provider profiles, try another approach with the auth schema
      if (Object.keys(providerProfiles).length === 0) {
        try {
          // Try to get user data directly using RPC or auth schema if available
          const { data: authUsersData, error: authUsersError } = await supabase
            .rpc('get_users_by_ids', { user_ids: providerIds });
            
          if (authUsersError) {
            console.error("Error fetching auth users data:", authUsersError);
          } else if (authUsersData) {
            providerProfiles = authUsersData.reduce((acc, user) => {
              acc[user.id] = user;
              return acc;
            }, {});
            console.log("Provider profiles fetched from rpc:", authUsersData.length);
          }
        } catch (rpcError) {
          console.error("RPC error or function not available:", rpcError);
        }
      }
    }

    // Transform offers with provider data and add dummy data if provider not found
    const offers: Offer[] = offersData.map(offer => {
      const providerData = providerProfiles[offer.provider_id] || null;
      console.log(`Processing offer ${offer.id}, provider:`, providerData);
      
      const providerName = providerData?.full_name || 
                           providerData?.name || 
                           `Provider #${offer.provider_id.substring(0, 8)}`;
      
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
