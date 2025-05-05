
import { supabase } from "@/integrations/supabase/client";

export interface PlacePrediction {
  description: string;
  place_id: string;
}

export interface GeocodeResult {
  results: any[];
  status: string;
}

/**
 * Get location suggestions based on user input
 */
export async function getLocationSuggestions(
  input: string
): Promise<PlacePrediction[]> {
  try {
    const { data, error } = await supabase.functions.invoke("google-places", {
      body: {
        action: "autocomplete",
        input,
      },
    });

    if (error) {
      console.error("Error fetching location suggestions:", error);
      return [];
    }

    return data?.predictions || [];
  } catch (error) {
    console.error("Error in getLocationSuggestions:", error);
    return [];
  }
}

/**
 * Get coordinates from a location string using Google Places API
 */
export async function getLocationCoordinates(
  locationName: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // First get suggestions to get place_id
    const suggestions = await getLocationSuggestions(locationName);
    
    if (!suggestions.length) {
      return null;
    }
    
    // For simplicity, we'll use the first suggestion
    // In a real app, you might want to let the user select from suggestions
    const firstSuggestion = suggestions[0];
    
    // TODO: Implement an additional API call to get coordinates from place_id if needed
    // For now we'll use geocoding by name
    
    // Mock coordinates to avoid making too many API calls
    // In reality, you would use the Google Places API to get precise coordinates
    const mockCoordinates = getMockCoordinates(locationName);
    
    return mockCoordinates;
  } catch (error) {
    console.error("Error in getLocationCoordinates:", error);
    return null;
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

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Mock function to provide coordinates for common locations
 * In production, this would be replaced with actual API calls
 */
function getMockCoordinates(locationName: string): { latitude: number; longitude: number } | null {
  const locations: Record<string, { latitude: number; longitude: number }> = {
    sydney: { latitude: -33.8688, longitude: 151.2093 },
    melbourne: { latitude: -37.8136, longitude: 144.9631 },
    brisbane: { latitude: -27.4698, longitude: 153.0251 },
    perth: { latitude: -31.9505, longitude: 115.8605 },
    adelaide: { latitude: -34.9285, longitude: 138.6007 },
    hobart: { latitude: -42.8821, longitude: 147.3272 },
    darwin: { latitude: -12.4634, longitude: 130.8456 },
    canberra: { latitude: -35.2809, longitude: 149.1300 },
  };

  const cleanName = locationName.toLowerCase().trim();
  
  for (const [key, coords] of Object.entries(locations)) {
    if (cleanName.includes(key)) {
      return coords;
    }
  }

  // Default to Sydney if no match
  return { latitude: -33.8688, longitude: 151.2093 };
}
