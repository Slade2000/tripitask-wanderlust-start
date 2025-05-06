
import { supabase } from "@/integrations/supabase/client";
import type { Offer } from "@/types/offer";

/**
 * Fetches all offers for a specific task
 */
export async function getTaskOffers(taskId: string): Promise<Offer[]> {
  try {
    console.log("Fetching offers for task:", taskId);
    
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

    // Fetch offers with a simpler query structure
    const { data: offersData, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .eq('task_id', taskId);

    if (offersError) {
      console.error("Error fetching offers:", offersError);
      throw offersError;
    }

    console.log("Raw offers data:", offersData);

    if (!offersData || offersData.length === 0) {
      console.log("No offers found for task:", taskId);
      return [];
    }

    // Get all provider IDs to fetch their details
    const providerIds = offersData
      .map(offer => offer.provider_id)
      .filter(Boolean);
    
    console.log("Provider IDs to fetch:", providerIds);

    // Fetch all relevant providers
    const { data: providers, error: providersError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', providerIds);
      
    if (providersError) {
      console.error("Error fetching provider details:", providersError);
    }

    // Create a lookup map for providers
    const providerMap = {};
    if (providers) {
      providers.forEach(provider => {
        providerMap[provider.id] = provider;
      });
    }
    
    console.log("Provider lookup map:", providerMap);

    // Transform offers with provider data
    const offers: Offer[] = offersData.map(offer => {
      const providerData = providerMap[offer.provider_id];
      console.log(`Processing offer ${offer.id}, provider:`, providerData);
      
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
          name: providerData?.full_name || 'Unknown Provider',
          avatar_url: providerData?.avatar_url || '',
          rating: undefined,
          success_rate: undefined
        }
      };
    });

    console.log("Transformed offers:", offers);
    return offers;
  } catch (error) {
    console.error("Error in getTaskOffers:", error);
    throw error;
  }
}

/**
 * Counts the total number of offers for a given task
 */
export async function countOffersForTask(taskId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('task_id', taskId);

    if (error) {
      console.error("Error counting task offers:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error counting task offers:", error);
    return 0;
  }
}

/**
 * Fetches all offers made by a specific provider
 */
export async function getProviderOffers(providerId: string): Promise<Offer[]> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        task:tasks(
          title,
          description,
          budget,
          due_date,
          status
        )
      `)
      .eq('provider_id', providerId);

    if (error) {
      console.error("Error fetching provider offers:", error);
      throw error;
    }

    const offers: Offer[] = data.map(offer => ({
      id: offer.id,
      task_id: offer.task_id,
      provider_id: offer.provider_id,
      amount: offer.amount,
      expected_delivery_date: offer.expected_delivery_date,
      message: offer.message || undefined,
      status: offer.status as 'pending' | 'accepted' | 'rejected',
      created_at: offer.created_at,
      task: offer.task as Offer['task']
    }));

    return offers || [];
  } catch (error) {
    console.error("Error fetching provider offers:", error);
    return [];
  }
}
