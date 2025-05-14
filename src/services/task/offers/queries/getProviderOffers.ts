
import { supabase } from "@/integrations/supabase/client";

export async function getProviderOffers(providerId: string) {
  try {
    console.log("Fetching offers for provider:", providerId);
    
    if (!providerId) {
      console.error("No provider ID provided to getProviderOffers");
      throw new Error("Provider ID is required to fetch offers");
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
      throw new Error(error.message);
    }

    console.log(`Found ${data?.length || 0} offers for provider ${providerId}`);
    return data || [];
  } catch (error) {
    console.error("Error in getProviderOffers:", error);
    throw error;
  }
}
