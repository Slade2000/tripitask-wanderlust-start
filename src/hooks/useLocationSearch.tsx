
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
  const { debounceTime = 300, initialTerm = "" } = options; // Reduced debounce time for better UX
  const [searchTerm, setSearchTerm] = useState<string>(initialTerm);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceTime);
  
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearchTerm) {
        setSuggestions([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching suggestions for:", debouncedSearchTerm);
        const results = await getLocationSuggestions(debouncedSearchTerm);
        console.log("Got suggestions:", results);
        setSuggestions(results);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setSuggestions([]);
        setError(error instanceof Error ? error.message : "Failed to fetch location suggestions");
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
