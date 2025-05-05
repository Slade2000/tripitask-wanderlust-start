
import { useState, useEffect } from "react";
import { getLocationSuggestions, PlacePrediction } from "@/services/locationService";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Custom hook for location search with debounce
 */
export const useLocationSearch = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedSearchTerm) {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      const results = await getLocationSuggestions(debouncedSearchTerm);
      setSuggestions(results);
      setIsLoading(false);
    };
    
    fetchSuggestions();
  }, [debouncedSearchTerm]);
  
  return { searchTerm, setSearchTerm, suggestions, isLoading };
};
