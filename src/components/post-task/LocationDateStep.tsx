import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { getLocationCoordinates } from "@/services/location";
import LocationAutoComplete from "./location/LocationAutoComplete";
import DatePicker from "./location/DatePicker";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";

export interface LocationDateFormData {
  location: string;
  dueDate: Date;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface LocationDateProps {
  initialData: {
    location: string;
    dueDate: Date | undefined;
    description: string;
  };
  onSubmit: (data: LocationDateFormData) => void;
  onBack: () => void;
}

const LocationDateStep = ({
  initialData,
  onSubmit,
  onBack
}: LocationDateProps) => {
  const [location, setLocation] = useState(initialData.location);
  const [dueDate, setDueDate] = useState<Date | undefined>(initialData.dueDate);
  const [description, setDescription] = useState(initialData.description);
  const [coordinates, setCoordinates] = useState<{ latitude: number | null; longitude: number | null }>({ 
    latitude: null, 
    longitude: null 
  });
  
  const { loading: loadingLocation, detectCurrentLocation } = useCurrentLocation();

  const handleSubmit = async () => {
    // If we have a location but no coordinates, try to get them
    if (location && (!coordinates.latitude || !coordinates.longitude)) {
      try {
        const locationCoords = await getLocationCoordinates(location);
        if (locationCoords) {
          setCoordinates(locationCoords);
          console.log(`Found coordinates for ${location}: ${JSON.stringify(locationCoords)}`);
        }
      } catch (error) {
        console.error("Error getting coordinates:", error);
      }
    }
    
    if (!dueDate) {
      // Add a default date if none selected
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7); // Default to 7 days from now
      onSubmit({
        location,
        dueDate: defaultDate,
        description,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      });
      return;
    }
    
    onSubmit({
      location,
      dueDate,
      description,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    });
  };

  const handleCurrentLocation = async () => {
    try {
      const result = await detectCurrentLocation();
      if (result.formattedAddress) {
        setLocation(result.formattedAddress);
      }
      if (result.coordinates) {
        setCoordinates(result.coordinates);
      }
    } catch (error) {
      // Error handling is done in the hook
      console.error("Failed to get current location:", error);
    }
  };

  const handleLocationSelect = async (prediction: { description: string; place_id: string }) => {
    setLocation(prediction.description);
    
    // Get coordinates for the selected location
    try {
      const locationCoords = await getLocationCoordinates(prediction.description);
      if (locationCoords) {
        setCoordinates(locationCoords);
        console.log(`Found coordinates for ${prediction.description}: ${JSON.stringify(locationCoords)}`);
      }
    } catch (error) {
      console.error("Error getting coordinates for prediction:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-teal-dark text-center">
        Where and When?
      </h2>

      <div className="space-y-3">
        <Label htmlFor="location" className="text-teal-dark">
          Location
        </Label>
        <LocationAutoComplete
          location={location}
          onLocationChange={setLocation}
          onSelectLocation={handleLocationSelect}
        />
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCurrentLocation} 
          disabled={loadingLocation} 
          className="text-xs h-8 mt-1 flex items-center"
        >
          {loadingLocation ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin mr-1" /> 
              Detecting location...
            </>
          ) : "Use current location"}
        </Button>
        
        {coordinates.latitude && coordinates.longitude && (
          <div className="text-xs text-green-600">
            Coordinates detected: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-teal-dark">Preferred Due Date</Label>
        <DatePicker
          date={dueDate}
          onDateSelect={setDueDate}
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="description" className="text-teal-dark">
          Describe the Task
        </Label>
        <Textarea 
          id="description" 
          placeholder="Summarize key details" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          className="min-h-[120px] text-base bg-white" 
        />
      </div>

      <div className="flex flex-col pt-6">
        <Button 
          onClick={handleSubmit} 
          className="w-full bg-gold hover:bg-orange text-teal-dark py-6 text-lg"
        >
          {loadingLocation ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> 
              Processing...
            </>
          ) : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default LocationDateStep;
