
import { supabase } from "@/integrations/supabase/client";
import type { Offer } from "@/types/offer";

export async function getTaskOffers(taskId: string): Promise<Offer[]> {
  try {
    console.log("Fetching offers for task:", taskId);
    
    // Modified query with better join syntax and error handling
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        provider:profiles!provider_id(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('task_id', taskId);

    if (error) {
      console.error("Error fetching task offers:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("No offers found for task:", taskId);
      return [];
    }

    console.log("Raw offers data:", data); // Log raw data for debugging

    // Transform data with better null handling
    const offers: Offer[] = data.map(offer => ({
      id: offer.id,
      task_id: offer.task_id,
      provider_id: offer.provider_id,
      amount: offer.amount,
      expected_delivery_date: offer.expected_delivery_date,
      message: offer.message || undefined,
      status: offer.status as 'pending' | 'accepted' | 'rejected',
      created_at: offer.created_at,
      provider: {
        id: offer.provider?.id || offer.provider_id || '',
        name: offer.provider?.full_name || 'Unknown Provider',
        avatar_url: offer.provider?.avatar_url || '',
      }
    }));

    console.log("Transformed offers:", offers); // Log transformed data for debugging
    return offers;
  } catch (error) {
    console.error("Error fetching task offers:", error);
    return [];
  }
}

export async function submitOffer(offer: {
  task_id: string;
  amount: number; 
  expected_delivery_date: string;
  message?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from('offers')
      .insert({
        task_id: offer.task_id,
        provider_id: userData.user.id,
        amount: offer.amount,
        expected_delivery_date: offer.expected_delivery_date,
        message: offer.message || null,
        status: 'pending'
      });

    if (error) {
      console.error("Error submitting offer:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting offer:", error);
    return { success: false, error: error.message };
  }
}

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

export async function updateOfferStatus(
  offerId: string, 
  status: 'accepted' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('offers')
      .update({ status })
      .eq('id', offerId);

    if (error) {
      console.error("Error updating offer status:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating offer status:", error);
    return { success: false, error: error.message };
  }
}

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
