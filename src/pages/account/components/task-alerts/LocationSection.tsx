
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface LocationSectionProps {
  locations: string[];
  addLocation: (location: string) => void;
  removeLocation: (location: string) => void;
  distanceRadius: number[];
  setDistanceRadius: (radius: number[]) => void;
}

const LocationSection = ({
  locations,
  addLocation,
  removeLocation,
  distanceRadius,
  setDistanceRadius
}: LocationSectionProps) => {
  const [newLocation, setNewLocation] = useState("");

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
          onValueChange={setDistanceRadius}
        />
      </div>
    </div>
  );
};

export default LocationSection;
