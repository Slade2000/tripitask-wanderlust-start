
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllAvailableTasks } from "@/services/taskService";
import { useToast } from "@/hooks/use-toast";

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

  // Fetch available tasks
  const { data: tasks = [], isLoading: tasksLoading, error, refetch } = useQuery({
    queryKey: ["availableTasks", searchQuery, selectedCategory, distanceRadius[0], budgetRange[0], currentUserLocation?.latitude, currentUserLocation?.longitude, futureLocation.name],
    queryFn: async () => {
      try {
        console.log("Fetching tasks with filters:", {
          searchQuery,
          categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
          distanceRadius: distanceRadius[0],
          maxBudget: budgetRange[0],
          locationName: currentUserLocation?.name,
          latitude: currentUserLocation?.latitude,
          longitude: currentUserLocation?.longitude,
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
          locationName: currentUserLocation?.name,
          ...(currentUserLocation && {
            latitude: currentUserLocation.latitude,
            longitude: currentUserLocation.longitude,
          }),
        });
        
        console.log("Tasks fetched from database:", result);
        return result;
      } catch (err) {
        console.error("Error fetching tasks:", err);
        throw err;
      }
    },
    // Enable the query as soon as we have location data
    enabled: !!currentUserLocation,
    staleTime: 30000, // 30 seconds before refetch
  });

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
