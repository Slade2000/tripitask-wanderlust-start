
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

    console.log("Task exists:", taskData);

    // Fetch the offers first
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
    
    // Get unique provider IDs from the offers
    const providerIds = [...new Set(offersData.map(offer => offer.provider_id))];
    console.log("Provider IDs to fetch:", providerIds);
    
    // Fetch all provider profiles from profiles table - this is critical for provider names
    const { data: providersData, error: providersError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', providerIds);
      
    if (providersError) {
      console.error("Error fetching profiles:", providersError);
      throw new Error(`Failed to fetch provider profiles: ${providersError.message}`);
    }
    
    console.log("Providers data returned from DB:", providersData);
    
    // Create a map of provider data for quick lookup
    const providersMap: Record<string, any> = {};
    
    if (providersData && providersData.length > 0) {
      console.log("Processing provider profile data. Count:", providersData.length);
      
      providersData.forEach(provider => {
        console.log(`Provider ${provider.id} profile data:`, provider);
        providersMap[provider.id] = {
          id: provider.id,
          full_name: provider.full_name || "User", // Ensure there's a name
          avatar_url: provider.avatar_url
        };
      });
    } else {
      console.warn("No provider profiles found in database");
    }
    
    // Try to get additional user details from auth.users if the RPC function exists
    try {
      interface UserDetails {
        id: string;
        email: string;
        raw_user_meta_data?: {
          full_name?: string;
          name?: string;
        };
      }

      const { data: authUsersData, error: authUsersError } = await supabase.rpc('get_user_details', { 
        user_ids: providerIds
      });
        
      if (authUsersError) {
        console.error("Error fetching auth users:", authUsersError);
        console.log("Continuing with profile data only");
        // Continue with profile data only
      } else if (authUsersData) {
        // Process auth user data if available
        const typedAuthUsersData = authUsersData as UserDetails[];
        console.log("Auth user data received:", typedAuthUsersData);
        
        typedAuthUsersData.forEach((user) => {
          if (!user || !user.id) return;
          
          const userData = user.raw_user_meta_data || {};
          const fullName = userData.full_name || userData.name;
          
          console.log(`Auth user ${user.id} data:`, { fullName, email: user.email });
          
          // Only overwrite if we have some data in the providersMap already
          if (providersMap[user.id]) {
            // If the profile didn't have a name, but auth does, use auth's name
            if (!providersMap[user.id].full_name || providersMap[user.id].full_name === "User") {
              providersMap[user.id].full_name = fullName || "User";
            }
            providersMap[user.id].email = user.email;
          } else {
            // Create new entry if we somehow have auth data but no profile data
            providersMap[user.id] = {
              id: user.id,
              full_name: fullName || "User",
              email: user.email
            };
          }
        });
      }
    } catch (rpcError) {
      // The RPC function might not exist, which is fine - we'll use profile data
      console.log("RPC function get_user_details may not exist:", rpcError);
    }

    console.log("Final provider data map:", providersMap);

    // Transform the offers with provider details included
    const offers: Offer[] = offersData.map((offer: any) => {
      // Get provider data from the map, or use defaults
      const providerData = providersMap[offer.provider_id] || { id: offer.provider_id, full_name: "User" };
      
      // Never use "Provider" as the name - use a better fallback
      let providerName = providerData.full_name || "User";
      
      // If we still don't have a name, try the email
      if (!providerName || providerName === "User") {
        providerName = providerData.email || `User ${offer.provider_id.substring(0, 4)}`;
      }
      
      console.log(`Final provider ${offer.provider_id} name: ${providerName}`);
      
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
          avatar_url: providerData?.avatar_url || undefined,
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
