
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllAvailableTasks } from "@/services/taskService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TaskLocation {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  latitude?: number;
  longitude?: number;
}

export interface TaskFilterState {
  searchQuery: string;
  selectedCategory: string;
  distanceRadius: number[];
  budgetRange: number[];
  filterOpen: boolean;
}

export const useTaskFilter = () => {
  const { toast } = useToast();
  const { user } = useAuth();  // Get the current user from AuthContext
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [distanceRadius, setDistanceRadius] = useState([100]); // Default 100km
  const [budgetRange, setBudgetRange] = useState([500]); // Default $500
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Current location for filtering
  const [currentUserLocation, setCurrentUserLocation] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  
  // Add a flag to track if we should apply location filtering
  const [applyLocationFilter, setApplyLocationFilter] = useState(true);
  
  const [futureLocation, setFutureLocation] = useState<TaskLocation>({
    name: "",
    startDate: undefined,
    endDate: undefined,
  });

  // Set user's location from browser geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          setCurrentUserLocation({
            name: "Current Location",
            ...coords,
          });
          
          console.log("Set user location to:", coords);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          toast({
            title: "Location Error",
            description: "Could not get your location. Using default location.",
            variant: "destructive",
          });
          // Set default location if geolocation fails
          setCurrentUserLocation({
            name: "Sydney",
            latitude: -33.8688,
            longitude: 151.2093,
          });
        }
      );
    } else {
      // Set default location if geolocation not supported
      setCurrentUserLocation({
        name: "Sydney",
        latitude: -33.8688,
        longitude: 151.2093,
      });
    }
  }, []);

  // Clear all filters
  const clearFilters = () => {
    console.log("Clearing all filters");
    setSearchQuery("");
    setSelectedCategory("");
    setDistanceRadius([100]);
    setBudgetRange([500]);
    setFutureLocation({
      name: "",
      startDate: undefined,
      endDate: undefined,
    });
    
    // Set the flag to disable location filtering, while keeping the current location info
    setApplyLocationFilter(false);
  };

  // Fetch available tasks
  const { data: tasks = [], isLoading: tasksLoading, error, refetch } = useQuery({
    queryKey: ["availableTasks", searchQuery, selectedCategory, distanceRadius[0], budgetRange[0], applyLocationFilter ? currentUserLocation?.latitude : null, applyLocationFilter ? currentUserLocation?.longitude : null, futureLocation.name, user?.id],
    queryFn: async () => {
      try {
        console.log("Fetching tasks with filters:", {
          searchQuery,
          categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
          distanceRadius: distanceRadius[0],
          maxBudget: budgetRange[0],
          locationName: applyLocationFilter ? currentUserLocation?.name : undefined,
          latitude: applyLocationFilter ? currentUserLocation?.latitude : undefined,
          longitude: applyLocationFilter ? currentUserLocation?.longitude : undefined,
          userId: user?.id,  // Add current user ID to filter params
        });

        // Add mock data if no location for testing only
        if (!currentUserLocation) {
          console.log("No location available yet, using default");
        }

        const result = await getAllAvailableTasks({
          searchQuery,
          categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
          distanceRadius: distanceRadius[0],
          maxBudget: budgetRange[0],
          ...(applyLocationFilter && currentUserLocation && {
            locationName: currentUserLocation.name,
            latitude: currentUserLocation.latitude,
            longitude: currentUserLocation.longitude,
          }),
          userId: user?.id,  // Pass the current user ID
        });
        
        console.log("Tasks fetched from database:", result);
        return result;
      } catch (err) {
        console.error("Error fetching tasks:", err);
        throw err;
      }
    },
    // Enable the query as soon as we have user data
    enabled: true,
    staleTime: 0, // Changed from 30000 to 0 to always fetch fresh data
    refetchOnWindowFocus: true, // Added to refetch when window gets focus
  });

  // Re-enable location filtering when any filter is modified
  useEffect(() => {
    // If any filter changes except for applyLocationFilter, and filters were disabled, re-enable them
    if (!applyLocationFilter && 
        (searchQuery !== "" || 
         selectedCategory !== "" || 
         distanceRadius[0] !== 100 || 
         budgetRange[0] !== 500 || 
         futureLocation.name !== "")) {
      setApplyLocationFilter(true);
    }
  }, [searchQuery, selectedCategory, distanceRadius, budgetRange, futureLocation]);

  const toggleFilters = () => setFilterOpen(!filterOpen);

  return {
    filters: {
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      distanceRadius,
      setDistanceRadius,
      budgetRange,
      setBudgetRange,
      filterOpen,
      toggleFilters,
      clearFilters,
    },
    location: {
      currentUserLocation,
      setCurrentUserLocation,
      futureLocation,
      setFutureLocation,
    },
    tasks: {
      data: tasks,
      isLoading: tasksLoading,
      error,
      refetch,
    }
  };
};
