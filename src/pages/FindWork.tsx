
import { useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import FilterPanel from "@/components/find-work/FilterPanel";
import TaskList from "@/components/find-work/TaskList";
import SearchFilterBar from "@/components/find-work/SearchFilterBar";
import { useTaskFilter } from "@/hooks/useTaskFilter";
import { SaveFilterButton } from "@/components/find-work/SaveFilterButton";
import { useSavedFilters } from "@/hooks/useSavedFilters";
import { toast } from "sonner";

const FindWork = () => {
  const location = useLocation();
  const {
    filters: {
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      distanceRadius,
      setDistanceRadius,
      minBudget,
      setMinBudget,
      maxBudget,
      setMaxBudget,
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
  } = useTaskFilter();

  // Add saved filters hook
  const { saveFilter } = useSavedFilters();

  // Manual refetch button handler
  const handleRefresh = () => {
    refetch();
  };
  
  // Handler to save current filters
  const handleSaveFilter = (name: string) => {
    // Create a current filters object
    const currentFilters = {
      searchQuery,
      selectedCategory,
      distanceRadius,
      minBudget,
      maxBudget,
      location: currentUserLocation ? {
        name: currentUserLocation.name,
        latitude: currentUserLocation.latitude, 
        longitude: currentUserLocation.longitude
      } : null
    };
    
    return saveFilter(name, currentFilters);
  };

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">
          Find Work
        </h1>

        {/* Search and filter bar with save filter button */}
        <div className="flex items-center space-x-2 mb-4">
          <SearchFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterOpen={filterOpen}
            toggleFilters={toggleFilters}
            onRefresh={handleRefresh}
            onClearFilters={clearFilters}
          />
          
          <SaveFilterButton 
            currentFilters={{
              searchQuery,
              selectedCategory,
              distanceRadius,
              minBudget,
              maxBudget,
              location: currentUserLocation
            }}
            onSaveFilter={handleSaveFilter}
          />
        </div>

        {/* Advanced filters panel */}
        {filterOpen && (
          <FilterPanel
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            distanceRadius={distanceRadius}
            setDistanceRadius={setDistanceRadius}
            minBudget={minBudget}
            setMinBudget={setMinBudget}
            maxBudget={maxBudget}
            setMaxBudget={setMaxBudget}
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
          error={error}
          futureLocation={futureLocation}
          onRefresh={handleRefresh}
        />
      </div>
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default FindWork;
