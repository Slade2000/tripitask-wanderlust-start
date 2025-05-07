
import { supabase } from "@/integrations/supabase/client";
import { Coordinates } from "./types";
import { getMockCoordinates } from "./mocks";

/**
 * Get coordinates from a location string using Google Places API
 */
export async function getLocationCoordinates(
  locationName: string
): Promise<Coordinates | null> {
  try {
    // Log the request to help with debugging
    console.log(`Getting coordinates for location: "${locationName}"`);
    
    if (!locationName || locationName.trim() === '') {
      console.log("Empty location name, cannot get coordinates");
      return null;
    }
    
    // Call our edge function to get geocoding information
    const { data, error } = await supabase.functions.invoke("google-places", {
      body: {
        action: "geocode",
        address: locationName.trim(),
      },
    });
    
    if (error) {
      console.error("Error in geocode function:", error);
      // Fallback to mock coordinates if API call fails
      return getMockCoordinates(locationName);
    }
    
    if (data?.results && data.results.length > 0 && 
        data.results[0].geometry && data.results[0].geometry.location) {
      const location = data.results[0].geometry.location;
      console.log(`Got coordinates from API for "${locationName}":`, location);
      
      return {
        latitude: location.lat,
        longitude: location.lng
      };
    }
    
    // Fallback to mock coordinates if API returns invalid format
    console.log("API returned invalid format, using mock coordinates");
    return getMockCoordinates(locationName);
  } catch (error) {
    console.error("Error in getLocationCoordinates:", error);
    // Fallback to mock coordinates if API call fails
    return getMockCoordinates(locationName);
  }
}

/**
 * Get reverse geocoding from coordinates
 */
export async function getAddressFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("google-places", {
      body: {
        action: "geocode",
        latitude,
        longitude,
      },
    });

    if (error) {
      console.error("Error in reverse geocoding:", error);
      return null;
    }

    if (data?.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    return null;
  } catch (error) {
    console.error("Error in getAddressFromCoordinates:", error);
    return null;
  }
}
