
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LocationCoordinates {
  latitude: number | null;
  longitude: number | null;
}

export const useCurrentLocation = () => {
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<LocationCoordinates>({
    latitude: null,
    longitude: null
  });

  const detectCurrentLocation = (): Promise<{
    formattedAddress?: string;
    coordinates?: { latitude: number; longitude: number };
  }> => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        setLoading(false);
        reject(new Error("Geolocation not supported"));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(async position => {
        try {
          const { latitude, longitude } = position.coords;

          // Save coordinates
          const newCoordinates = { latitude, longitude };
          setCoordinates(newCoordinates);
          console.log(`Got coordinates from browser: ${latitude}, ${longitude}`);

          // Call our edge function with minimal auth requirements now
          try {
            const {
              data,
              error
            } = await supabase.functions.invoke('google-places', {
              body: {
                action: 'geocode',
                latitude,
                longitude
              }
            });
            
            if (error) {
              console.error("Error calling geocode function:", error);
              toast.error("Error detecting your location");
              setLoading(false);
              reject(error);
              return;
            }
            
            if (data.results && data.results.length > 0) {
              // Get the formatted address from the first result
              const formattedAddress = data.results[0].formatted_address;
              toast.success("Location found successfully!");
              resolve({
                formattedAddress,
                coordinates: newCoordinates
              });
            } else {
              toast.error("Could not find your location address.");
              reject(new Error("No location found"));
            }
          } catch (error) {
            console.error("API call error:", error);
            toast.error("Error calling location service");
            reject(error);
          }
        } catch (error) {
          console.error("Error getting location:", error);
          toast.error("Error detecting your location");
          reject(error);
        } finally {
          setLoading(false);
        }
      }, error => {
        console.error("Geolocation error:", error);
        toast.error("Could not access your location");
        setLoading(false);
        reject(error);
      });
    });
  };

  return {
    loading,
    coordinates,
    detectCurrentLocation
  };
};
