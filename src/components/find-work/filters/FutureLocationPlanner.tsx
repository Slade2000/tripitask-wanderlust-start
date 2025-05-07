
import React from "react";
import { format } from "date-fns";
import LocationSearchInput from "@/components/location/LocationSearchInput";
import DateRangePicker from "./DateRangePicker";
import { getLocationCoordinates } from "@/services/location";
import { useLocationSearch } from "@/hooks/useLocationSearch";

interface TaskLocation {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  latitude?: number;
  longitude?: number;
}

interface FutureLocationPlannerProps {
  futureLocation: TaskLocation;
  setFutureLocation: (location: TaskLocation) => void;
}

const FutureLocationPlanner: React.FC<FutureLocationPlannerProps> = ({
  futureLocation,
  setFutureLocation,
}) => {
  const [showFutureLocationSuggestions, setShowFutureLocationSuggestions] = React.useState(false);
  
  // Future location search
  const {
    searchTerm: futureSearchTerm,
    setSearchTerm: setFutureSearchTerm,
    suggestions: futureSuggestions,
    isLoading: futureIsLoading,
  } = useLocationSearch();

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
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setFutureLocation({...futureLocation, startDate: date});
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setFutureLocation({...futureLocation, endDate: date});
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-sm font-medium mb-2">Plan Future Location</h3>
      
      <LocationSearchInput 
        searchTerm={futureSearchTerm}
        setSearchTerm={setFutureSearchTerm}
        suggestions={futureSuggestions}
        isLoading={futureIsLoading}
        showSuggestions={showFutureLocationSuggestions}
        setShowSuggestions={setShowFutureLocationSuggestions}
        onLocationSelect={handleFutureLocationSelect}
        label=""
        placeholder="Location Name/Postcode"
      />
      
      {/* Date range picker */}
      <DateRangePicker
        startDate={futureLocation.startDate}
        endDate={futureLocation.endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
      />
      
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
  );
};

export default FutureLocationPlanner;
