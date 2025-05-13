
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface LocationData {
  useCurrentLocation: boolean;
  radius: number;
  customLocation: string;
}

interface LocationSectionProps {
  locationData?: LocationData;
  onLocationChange?: (locationData: any) => void;
}

const LocationSection = ({ locationData, onLocationChange }: LocationSectionProps) => {
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [distanceRadius, setDistanceRadius] = useState([30]); // km
  
  const addLocation = (location: string) => {
    if (location && !locations.includes(location)) {
      const updatedLocations = [...locations, location];
      setLocations(updatedLocations);
      
      if (onLocationChange && locationData) {
        onLocationChange({
          ...locationData,
          customLocation: updatedLocations.join(',')
        });
      }
    }
  };
  
  const removeLocation = (location: string) => {
    const updatedLocations = locations.filter(loc => loc !== location);
    setLocations(updatedLocations);
    
    if (onLocationChange && locationData) {
      onLocationChange({
        ...locationData,
        customLocation: updatedLocations.join(',')
      });
    }
  };
  
  const handleRadiusChange = (values: number[]) => {
    setDistanceRadius(values);
    
    if (onLocationChange && locationData) {
      onLocationChange({
        ...locationData,
        radius: values[0]
      });
    }
  };

  const handleAddLocation = () => {
    if (newLocation && !locations.includes(newLocation)) {
      addLocation(newLocation);
      setNewLocation("");
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Locations</h3>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {locations.map(location => (
          <Badge key={location} variant="secondary" className="pl-2 flex items-center gap-1">
            {location}
            <button 
              onClick={() => removeLocation(location)}
              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
            >
              <X size={14} />
            </button>
          </Badge>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Input
          placeholder="Add location"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          className="flex-grow"
        />
        <Button 
          onClick={handleAddLocation} 
          disabled={!newLocation}
          size="sm"
        >
          <Plus size={16} />
        </Button>
      </div>
      
      {/* Distance radius */}
      <div className="mt-4">
        <div className="flex justify-between mb-2 items-center">
          <h4 className="text-sm">Distance radius</h4>
          <span className="text-sm font-medium">{distanceRadius[0]} km</span>
        </div>
        <Slider
          defaultValue={distanceRadius}
          max={100}
          step={5}
          value={distanceRadius}
          onValueChange={handleRadiusChange}
        />
      </div>
    </div>
  );
};

export default LocationSection;
