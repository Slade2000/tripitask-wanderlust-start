
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getLocationCoordinates } from "@/services/locationService";

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
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [predictions, setPredictions] = useState<{
    description: string;
    place_id: string;
  }[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [fetchingPredictions, setFetchingPredictions] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number | null; longitude: number | null }>({ 
    latitude: null, 
    longitude: null 
  });
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSubmit = async () => {
    // If we have a location but no coordinates, try to get them
    if (location && (!coordinates.latitude || !coordinates.longitude)) {
      try {
        setLoadingLocation(true);
        const locationCoords = await getLocationCoordinates(location);
        if (locationCoords) {
          setCoordinates(locationCoords);
          console.log(`Found coordinates for ${location}: ${JSON.stringify(locationCoords)}`);
        }
      } catch (error) {
        console.error("Error getting coordinates:", error);
      } finally {
        setLoadingLocation(false);
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

  const handleDateSelect = (date: Date | undefined) => {
    setDueDate(date);
    setCalendarOpen(false); // Close calendar when date is selected
  };

  const handleCurrentLocation = async () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async position => {
        try {
          const {
            latitude,
            longitude
          } = position.coords;

          // Save coordinates
          setCoordinates({ latitude, longitude });
          console.log(`Got coordinates from browser: ${latitude}, ${longitude}`);

          // Call our edge function with minimal auth requirements now
          try {
            const {
              data,
              error
            } = await supabase.functions.invoke('google-places', {
              body: {
                action: 'geocode',
                latitude,
                longitude
              }
            });
            if (error) {
              console.error("Error calling geocode function:", error);
              toast.error("Error detecting your location");
              setLoadingLocation(false);
              return;
            }
            if (data.results && data.results.length > 0) {
              // Get the formatted address from the first result
              const formattedAddress = data.results[0].formatted_address;
              setLocation(formattedAddress);
              toast.success("Location found successfully!");
            } else {
              toast.error("Could not find your location address.");
            }
          } catch (error) {
            console.error("API call error:", error);
            toast.error("Error calling location service");
          }
        } catch (error) {
          console.error("Error getting location:", error);
          toast.error("Error detecting your location");
        } finally {
          setLoadingLocation(false);
        }
      }, error => {
        console.error("Geolocation error:", error);
        toast.error("Could not access your location");
        setLoadingLocation(false);
      });
    } else {
      toast.error("Geolocation is not supported by your browser");
      setLoadingLocation(false);
    }
  };

  const handleLocationInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    
    // Clear coordinates when location changes
    setCoordinates({ latitude: null, longitude: null });
    
    if (value.length > 2) {
      try {
        setFetchingPredictions(true);

        // Call our edge function with minimal auth requirements now
        const {
          data,
          error
        } = await supabase.functions.invoke('google-places', {
          body: {
            action: 'autocomplete',
            input: value
          }
        });
        if (error) {
          console.error("Error calling autocomplete function:", error);
          return;
        }
        if (data.predictions) {
          setPredictions(data.predictions);
          setShowPredictions(true);
        }
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      } finally {
        setFetchingPredictions(false);
      }
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const selectPrediction = async (prediction: {
    description: string;
    place_id: string;
  }) => {
    setLocation(prediction.description);
    setPredictions([]);
    setShowPredictions(false);
    
    // Get coordinates for the selected location
    try {
      setLoadingLocation(true);
      const locationCoords = await getLocationCoordinates(prediction.description);
      if (locationCoords) {
        setCoordinates(locationCoords);
        console.log(`Found coordinates for ${prediction.description}: ${JSON.stringify(locationCoords)}`);
      }
    } catch (error) {
      console.error("Error getting coordinates for prediction:", error);
    } finally {
      setLoadingLocation(false);
    }
  };

  // Close predictions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowPredictions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-teal-dark text-center">
        Where and When?
      </h2>

      <div className="space-y-3">
        <Label htmlFor="location" className="text-teal-dark">
          Location
        </Label>
        <div className="relative" ref={autocompleteRef}>
          <Input id="location" placeholder="Enter a location" value={location} onChange={handleLocationInputChange} className="pl-10 text-base bg-white" autoComplete="off" />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-dark h-5 w-5" />
          
          {/* Loading indicator for predictions */}
          {fetchingPredictions && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>}
          
          {/* Predictions dropdown */}
          {showPredictions && predictions.length > 0 && <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {predictions.map(prediction => <div key={prediction.place_id} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => selectPrediction(prediction)}>
                  {prediction.description}
                </div>)}
            </div>}
        </div>
        <Button type="button" variant="outline" onClick={handleCurrentLocation} disabled={loadingLocation} className="text-xs h-8 mt-1 flex items-center">
          {loadingLocation ? <>
              <Loader2 className="h-3 w-3 animate-spin mr-1" /> 
              Detecting location...
            </> : "Use current location"}
        </Button>
        
        {coordinates.latitude && coordinates.longitude && (
          <div className="text-xs text-green-600">
            Coordinates detected: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-teal-dark">Preferred Due Date</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-white", !dueDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dueDate} onSelect={handleDateSelect} initialFocus className={cn("p-3 pointer-events-auto")} disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-3">
        <Label htmlFor="description" className="text-teal-dark">
          Describe the Task
        </Label>
        <Textarea id="description" placeholder="Summarize key details" value={description} onChange={e => setDescription(e.target.value)} className="min-h-[120px] text-base bg-white" />
      </div>

      <div className="flex flex-col pt-6">
        <Button onClick={handleSubmit} className="w-full bg-gold hover:bg-orange text-teal-dark py-6 text-lg">
          {loadingLocation ? <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> 
            Processing...
          </> : "Next"}
        </Button>
      </div>
    </div>;
};

export default LocationDateStep;
