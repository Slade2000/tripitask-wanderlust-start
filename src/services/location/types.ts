
// Define types used across location services
export interface PlacePrediction {
  description: string;
  place_id: string;
}

export interface GeocodeResult {
  results: any[];
  status: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
