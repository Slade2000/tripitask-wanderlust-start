
import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import LocationSearchInput from "@/components/location/LocationSearchInput";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { getLocationCoordinates } from "@/services/locationService";
import { useCategories } from "@/hooks/useCategories";

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
  const { categories } = useCategories();
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  // Current location search
  const {
    searchTerm,
    setSearchTerm,
    suggestions,
    isLoading,
  } = useLocationSearch();
  
  // Future location search
  const {
    searchTerm: futureSearchTerm,
    setSearchTerm: setFutureSearchTerm,
    suggestions: futureSuggestions,
    isLoading: futureIsLoading,
  } = useLocationSearch();

  // Handle current location selection
  const handleLocationSelect = async (selectedLocation: string) => {
    setSearchTerm(selectedLocation);
    setShowLocationSuggestions(false);
    
    const coordinates = await getLocationCoordinates(selectedLocation);
    if (coordinates) {
      setCurrentUserLocation({
        name: selectedLocation,
        ...coordinates,
      });
    }
  };
  
  // Handle future location selection
  const handleFutureLocationSelect = async (selectedLocation: string) => {
    const coordinates = await getLocationCoordinates(selectedLocation);
    
    setFutureLocation({
      ...futureLocation,
      name: selectedLocation,
      ...(coordinates && {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      }),
    });
    setShowLocationSuggestions(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 animate-in slide-in-from-top">
      <h2 className="font-semibold mb-4">Advanced Filters</h2>
      
      {/* Category selector */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block">Category</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Location search */}
      <LocationSearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        suggestions={suggestions}
        isLoading={isLoading}
        showSuggestions={showLocationSuggestions}
        setShowSuggestions={setShowLocationSuggestions}
        onLocationSelect={handleLocationSelect}
        label="Your Location"
        placeholder="Enter your location"
        currentLocation={currentUserLocation?.name}
      />
      
      {/* Distance radius slider */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block">
          Distance Radius: {distanceRadius[0]} km
        </label>
        <Slider 
          value={distanceRadius}
          onValueChange={setDistanceRadius}
          max={100}
          step={5}
        />
      </div>
      
      {/* Budget range slider */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-1 block">
          Budget up to: ${budgetRange[0]}
        </label>
        <Slider 
          value={budgetRange}
          onValueChange={setBudgetRange}
          max={2000}
          step={50}
        />
      </div>
      
      {/* Future location */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-medium mb-2">Plan Future Location</h3>
        
        <LocationSearchInput 
          searchTerm={futureSearchTerm}
          setSearchTerm={setFutureSearchTerm}
          suggestions={futureSuggestions}
          isLoading={futureIsLoading}
          showSuggestions={showLocationSuggestions}
          setShowSuggestions={setShowLocationSuggestions}
          onLocationSelect={handleFutureLocationSelect}
          label=""
          placeholder="Location Name/Postcode"
        />
        
        {/* Date range picker */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {futureLocation.startDate ? (
                    format(futureLocation.startDate, "PP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={futureLocation.startDate}
                  onSelect={(date) => 
                    setFutureLocation({...futureLocation, startDate: date})
                  }
                  initialFocus
                  fromDate={new Date()}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label className="text-xs text-gray-500">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {futureLocation.endDate ? (
                    format(futureLocation.endDate, "PP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={futureLocation.endDate}
                  onSelect={(date) => 
                    setFutureLocation({...futureLocation, endDate: date})
                  }
                  initialFocus
                  fromDate={futureLocation.startDate || new Date()}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {futureLocation.name && futureLocation.startDate && futureLocation.endDate && (
          <div className="text-xs text-gray-500 italic mt-2">
            On {format(futureLocation.startDate, "PPP")}, I'll be in {futureLocation.name} for 
            {Math.round(
              (futureLocation.endDate.getTime() - futureLocation.startDate.getTime()) / 
              (1000 * 60 * 60 * 24)
            )} days
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
