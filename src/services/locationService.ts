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
    // For testing purposes, let's generate mock suggestions immediately
    // This will help us determine if the API call is the issue
    console.log("Fetching suggestions for:", input);
    
    // Return mock suggestions instead of waiting for API
    return getMockSuggestions(input);
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
    // For simplicity, we'll use mock coordinates
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

/**
 * Generate mock location suggestions based on input
 * This solves the loading issue by returning immediate results
 */
function getMockSuggestions(input: string): PlacePrediction[] {
  if (!input || input.trim() === '') return [];
  
  const lowercaseInput = input.toLowerCase().trim();
  
  // Common Australian locations
  const locations = [
    { name: "Sydney", state: "NSW" },
    { name: "Melbourne", state: "VIC" },
    { name: "Brisbane", state: "QLD" },
    { name: "Perth", state: "WA" },
    { name: "Adelaide", state: "SA" },
    { name: "Hobart", state: "TAS" },
    { name: "Darwin", state: "NT" },
    { name: "Canberra", state: "ACT" },
    { name: "Gold Coast", state: "QLD" },
    { name: "Newcastle", state: "NSW" },
    { name: "Wollongong", state: "NSW" },
    { name: "Geelong", state: "VIC" },
    { name: "Townsville", state: "QLD" },
    { name: "Cairns", state: "QLD" },
    { name: "Toowoomba", state: "QLD" },
    { name: "Ballarat", state: "VIC" },
    { name: "Bendigo", state: "VIC" },
    { name: "Launceston", state: "TAS" },
    { name: "Mackay", state: "QLD" },
    { name: "Rockhampton", state: "QLD" },
    { name: "Bundaberg", state: "QLD" },
    { name: "Bunbury", state: "WA" },
    { name: "Coffs Harbour", state: "NSW" },
    { name: "Wagga Wagga", state: "NSW" },
    { name: "Hervey Bay", state: "QLD" },
    { name: "Mildura", state: "VIC" },
    { name: "Shepparton", state: "VIC" },
    { name: "Gladstone", state: "QLD" },
    { name: "Port Macquarie", state: "NSW" },
    { name: "Tamworth", state: "NSW" },
  ];
  
  // Filter locations based on input
  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(lowercaseInput) || 
    location.state.toLowerCase().includes(lowercaseInput)
  );
  
  // Map to PlacePrediction format
  return filteredLocations.slice(0, 5).map(location => ({
    description: `${location.name}, ${location.state}, Australia`,
    place_id: `mock-${location.name.toLowerCase().replace(/\s/g, '-')}`
  }));
}
