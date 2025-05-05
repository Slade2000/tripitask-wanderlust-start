
import { useState, useEffect } from "react";
import { getLocationSuggestions, PlacePrediction } from "@/services/locationService";
import { useDebounce } from "@/hooks/useDebounce";

interface UseLocationSearchOptions {
  debounceTime?: number;
  initialTerm?: string;
}

/**
 * Custom hook for location search with debounce
 */
export const useLocationSearch = (options: UseLocationSearchOptions = {}) => {
  const { debounceTime = 200, initialTerm = "" } = options; // Reduced debounce time for better UX
  const [searchTerm, setSearchTerm] = useState<string>(initialTerm);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceTime);
  
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.trim().length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching suggestions for:", debouncedSearchTerm);
        // Use a timeout to simulate network request and ensure UI updates
        const results = await Promise.race([
          getLocationSuggestions(debouncedSearchTerm),
          // Add a timeout to ensure we get a result
          new Promise<PlacePrediction[]>((resolve) => {
            setTimeout(() => {
              // If the real API is taking too long, provide fallback results
              console.log("Search timeout - providing fallback results");
              resolve([{
                description: `${debouncedSearchTerm}, Australia`,
                place_id: `fallback-${debouncedSearchTerm.toLowerCase().replace(/\s/g, '-')}`
              }]);
            }, 800);
          })
        ]);
        
        console.log("Got suggestions:", results);
        setSuggestions(results);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setSuggestions([]);
        setError(error instanceof Error ? error.message : "Failed to fetch location suggestions");
        // Even on error, provide a fallback result
        setSuggestions([{
          description: `${debouncedSearchTerm}, Australia`,
          place_id: `fallback-${debouncedSearchTerm.toLowerCase().replace(/\s/g, '-')}`
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [debouncedSearchTerm, debounceTime]);
  
  const resetSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
    setError(null);
  };
  
  return { 
    searchTerm, 
    setSearchTerm, 
    suggestions, 
    isLoading, 
    error,
    resetSearch
  };
};
