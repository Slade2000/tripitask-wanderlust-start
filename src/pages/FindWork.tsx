
import { useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import FilterPanel from "@/components/find-work/FilterPanel";
import TaskList from "@/components/find-work/TaskList";
import SearchFilterBar from "@/components/find-work/SearchFilterBar";
import { useTaskFilter } from "@/hooks/useTaskFilter";

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
  } = useTaskFilter();

  // Manual refetch button handler
  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">
          Find Work
        </h1>

        {/* Search and filter bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterOpen={filterOpen}
          toggleFilters={toggleFilters}
          onRefresh={handleRefresh}
        />

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
