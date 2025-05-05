
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import FilterPanel from "@/components/find-work/FilterPanel";
import TaskList from "@/components/find-work/TaskList";
import { getAllAvailableTasks } from "@/services/taskService";

interface TaskLocation {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  latitude?: number;
  longitude?: number;
}

const FindWork = () => {
  const location = useLocation();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [distanceRadius, setDistanceRadius] = useState([25]); // km
  const [budgetRange, setBudgetRange] = useState([500]); // dollars
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
        },
        (error) => {
          console.error("Error getting geolocation:", error);
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
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["availableTasks", searchQuery, selectedCategory, distanceRadius, budgetRange, currentUserLocation, futureLocation],
    queryFn: () => getAllAvailableTasks({
      searchQuery,
      categoryId: selectedCategory,
      distanceRadius: distanceRadius[0],
      maxBudget: budgetRange[0],
      locationName: currentUserLocation?.name,
      ...(currentUserLocation && {
        latitude: currentUserLocation.latitude,
        longitude: currentUserLocation.longitude,
      }),
    }),
    // Only run the query when we have user's location
    enabled: !!currentUserLocation,
  });

  // Filter toggle
  const toggleFilters = () => setFilterOpen(!filterOpen);

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">
          Find Work
        </h1>

        {/* Search and filter bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search tasks by keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          <Button 
            variant={filterOpen ? "default" : "outline"} 
            size="icon" 
            onClick={toggleFilters}
            className="flex-shrink-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Advanced filters panel */}
        {filterOpen && (
          <FilterPanel
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            distanceRadius={distanceRadius}
            setDistanceRadius={setDistanceRadius}
            budgetRange={budgetRange}
            setBudgetRange={setBudgetRange}
            currentUserLocation={currentUserLocation}
            setCurrentUserLocation={setCurrentUserLocation}
            futureLocation={futureLocation}
            setFutureLocation={setFutureLocation}
          />
        )}

        {/* Task listings */}
        <TaskList 
          tasks={tasks} 
          tasksLoading={tasksLoading}
          futureLocation={futureLocation} 
        />
      </div>
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default FindWork;
