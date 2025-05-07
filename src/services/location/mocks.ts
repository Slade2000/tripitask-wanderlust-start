import { Coordinates } from "./types";
import { PlacePrediction } from "./types";

/**
 * Mock function to provide coordinates for common locations
 * Enhanced with more locations including Ellenbrook and Perth suburbs
 */
export function getMockCoordinates(locationName: string): Coordinates | null {
  const locations: Record<string, Coordinates> = {
    // Australia's major cities with precise coordinates
    sydney: { latitude: -33.8688, longitude: 151.2093 },
    melbourne: { latitude: -37.8136, longitude: 144.9631 },
    brisbane: { latitude: -27.4698, longitude: 153.0251 },
    perth: { latitude: -31.9505, longitude: 115.8605 },
    adelaide: { latitude: -34.9285, longitude: 138.6007 },
    hobart: { latitude: -42.8821, longitude: 147.3272 },
    darwin: { latitude: -12.4634, longitude: 130.8456 },
    canberra: { latitude: -35.2809, longitude: 149.1300 },
    // Add more cities as needed
    "gold coast": { latitude: -28.0167, longitude: 153.4000 },
    wollongong: { latitude: -34.4331, longitude: 150.8831 },
    newcastle: { latitude: -32.9283, longitude: 151.7817 },
    geelong: { latitude: -38.1499, longitude: 144.3617 },
    townsville: { latitude: -19.2590, longitude: 146.8169 },
    cairns: { latitude: -16.9186, longitude: 145.7781 },
    // Add Ellenbrook with correct coordinates
    ellenbrook: { latitude: -31.7833, longitude: 116.0167 },
    // Add more Perth suburbs
    joondalup: { latitude: -31.7438, longitude: 115.7655 },
    fremantle: { latitude: -32.0560, longitude: 115.7471 },
    mandurah: { latitude: -32.5280, longitude: 115.7401 },
    rockingham: { latitude: -32.2809, longitude: 115.7232 },
    armadale: { latitude: -32.1533, longitude: 116.0139 },
    midland: { latitude: -31.8898, longitude: 116.0086 },
    kalamunda: { latitude: -31.9705, longitude: 116.0579 }
  };

  // Clean and normalize the input
  const cleanName = locationName.toLowerCase().trim();
  
  console.log(`Searching for coordinates for location: "${cleanName}"`);
  
  // First try exact match
  if (locations[cleanName]) {
    console.log(`Found exact match for "${cleanName}"`);
    return locations[cleanName];
  }
  
  // Then try partial match
  for (const [key, coords] of Object.entries(locations)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      console.log(`Found partial match: "${cleanName}" matches with "${key}"`);
      return coords;
    }
  }

  // No match found
  console.log(`No coordinate match found for "${cleanName}", using Perth as default`);
  // Default to Perth if no match (changed from Sydney)
  return { latitude: -31.9505, longitude: 115.8605 };
}

/**
 * Generate mock location suggestions based on input
 * This provides fallback if the Google API fails
 */
export function getMockSuggestions(input: string): PlacePrediction[] {
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
    // Add Perth suburbs with WA state
    { name: "Ellenbrook", state: "WA" },
    { name: "Joondalup", state: "WA" },
    { name: "Fremantle", state: "WA" },
    { name: "Mandurah", state: "WA" },
    { name: "Rockingham", state: "WA" },
    { name: "Armadale", state: "WA" },
    { name: "Midland", state: "WA" },
    { name: "Kalamunda", state: "WA" },
    // Keep remaining cities
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
