
import React from "react";
import { Input } from "@/components/ui/input";
import { PlacePrediction } from "@/services/locationService";

interface LocationSearchInputProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  suggestions: PlacePrediction[];
  isLoading: boolean;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  onLocationSelect: (location: string) => void;
  label?: string;
  placeholder?: string;
  currentLocation?: string;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  searchTerm,
  setSearchTerm,
  suggestions,
  isLoading,
  showSuggestions,
  setShowSuggestions,
  onLocationSelect,
  label = "Location",
  placeholder = "Enter location",
  currentLocation,
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="text-sm font-medium mb-1 block">{label}</label>
      )}
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        {showSuggestions && searchTerm !== "" && (
          <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
            {isLoading ? (
              <div className="p-2 text-gray-500">Loading...</div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <div
                  key={suggestion.place_id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onLocationSelect(suggestion.description);
                    setSearchTerm(suggestion.description);
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion.description}
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500">No results found</div>
            )}
          </div>
        )}
      </div>
      {currentLocation && (
        <p className="text-xs text-gray-500 mt-1">
          Using: {currentLocation}
        </p>
      )}
    </div>
  );
};

export default LocationSearchInput;
