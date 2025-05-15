
import { supabase } from "@/integrations/supabase/client";

export async function getProviderOffers(providerId: string) {
  try {
    console.log("Fetching offers for provider:", providerId);
    
    if (!providerId) {
      console.error("No provider ID provided to getProviderOffers");
      return []; // Return empty array instead of throwing error
    }

    // Fetch offers with task details
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        task:tasks(id, title, budget, due_date, status)
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching provider offers:", error);
      return []; // Return empty array instead of throwing error
    }

    console.log(`Found ${data?.length || 0} offers for provider ${providerId}`);
    return data || []; // Ensure we always return an array
  } catch (error) {
    console.error("Error in getProviderOffers:", error);
    return []; // Return empty array on any error
  }
}
