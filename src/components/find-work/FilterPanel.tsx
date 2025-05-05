
import React from "react";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { getLocationCoordinates } from "@/services/locationService";
import LocationSearchInput from "@/components/location/LocationSearchInput";
import CategorySelect from "./filters/CategorySelect";
import DistanceSlider from "./filters/DistanceSlider";
import BudgetSlider from "./filters/BudgetSlider";
import FutureLocationPlanner from "./filters/FutureLocationPlanner";

interface TaskLocation {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  latitude?: number;
  longitude?: number;
}

interface FilterPanelProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  distanceRadius: number[];
  setDistanceRadius: (radius: number[]) => void;
  budgetRange: number[];
  setBudgetRange: (budget: number[]) => void;
  currentUserLocation: {
    name: string;
    latitude: number;
    longitude: number;
  } | null;
  setCurrentUserLocation: (location: {
    name: string;
    latitude: number;
    longitude: number;
  } | null) => void;
  futureLocation: TaskLocation;
  setFutureLocation: (location: TaskLocation) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedCategory,
  setSelectedCategory,
  distanceRadius,
  setDistanceRadius,
  budgetRange,
  setBudgetRange,
  currentUserLocation,
  setCurrentUserLocation,
  futureLocation,
  setFutureLocation,
}) => {
  const [showCurrentLocationSuggestions, setShowCurrentLocationSuggestions] = React.useState(false);
  
  // Current location search
  const {
    searchTerm: currentSearchTerm,
    setSearchTerm: setCurrentSearchTerm,
    suggestions: currentSuggestions,
    isLoading: currentIsLoading,
  } = useLocationSearch();

  // Handle current location selection
  const handleLocationSelect = async (selectedLocation: string) => {
    const coordinates = await getLocationCoordinates(selectedLocation);
    if (coordinates) {
      setCurrentUserLocation({
        name: selectedLocation,
        ...coordinates,
      });
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 animate-in slide-in-from-top">
      <h2 className="font-semibold mb-4">Advanced Filters</h2>
      
      {/* Category selector */}
      <CategorySelect 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} 
      />
      
      {/* Location search */}
      <LocationSearchInput
        searchTerm={currentSearchTerm}
        setSearchTerm={setCurrentSearchTerm}
        suggestions={currentSuggestions}
        isLoading={currentIsLoading}
        showSuggestions={showCurrentLocationSuggestions}
        setShowSuggestions={setShowCurrentLocationSuggestions}
        onLocationSelect={handleLocationSelect}
        label="Your Location"
        placeholder="Enter your location"
        currentLocation={currentUserLocation?.name}
      />
      
      {/* Distance radius slider */}
      <DistanceSlider 
        distanceRadius={distanceRadius} 
        setDistanceRadius={setDistanceRadius} 
      />
      
      {/* Budget range slider */}
      <BudgetSlider 
        budgetRange={budgetRange} 
        setBudgetRange={setBudgetRange} 
      />
      
      {/* Future location */}
      <FutureLocationPlanner 
        futureLocation={futureLocation} 
        setFutureLocation={setFutureLocation} 
      />
    </div>
  );
};

export default FilterPanel;
