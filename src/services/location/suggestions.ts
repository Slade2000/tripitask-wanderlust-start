
import { supabase } from "@/integrations/supabase/client";
import { PlacePrediction } from "./types";
import { getMockSuggestions } from "./mocks";

/**
 * Get location suggestions based on user input
 */
export async function getLocationSuggestions(
  input: string
): Promise<PlacePrediction[]> {
  try {
    console.log("Fetching suggestions for:", input);
    
    if (!input || input.trim().length < 2) {
      return [];
    }
    
    // Call our edge function with the Google Places API
    const { data, error } = await supabase.functions.invoke("google-places", {
      body: {
        action: "autocomplete",
        input: input.trim(),
      },
    });
    
    if (error) {
      console.error("Error in autocomplete function:", error);
      // Fallback to mock data if API call fails
      return getMockSuggestions(input);
    }
    
    if (data?.predictions && Array.isArray(data.predictions)) {
      console.log(`Received ${data.predictions.length} suggestions from API`);
      return data.predictions;
    }
    
    // Fallback to mock data if API returns invalid format
    console.log("API returned invalid format, using mock data");
    return getMockSuggestions(input);
  } catch (error) {
    console.error("Error in getLocationSuggestions:", error);
    // Fallback to mock data if API call fails
    return getMockSuggestions(input);
  }
}
