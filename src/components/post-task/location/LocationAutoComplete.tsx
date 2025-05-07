
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LocationAutoCompleteProps {
  location: string;
  onLocationChange: (value: string) => void;
  onSelectLocation: (prediction: { description: string; place_id: string }) => void;
  className?: string;
}

const LocationAutoComplete = ({
  location,
  onLocationChange,
  onSelectLocation,
  className,
}: LocationAutoCompleteProps) => {
  const [predictions, setPredictions] = useState<{ description: string; place_id: string }[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [fetchingPredictions, setFetchingPredictions] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const handleLocationInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onLocationChange(value);
    
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

  return (
    <div className="relative" ref={autocompleteRef}>
      <Input 
        placeholder="Enter a location" 
        value={location} 
        onChange={handleLocationInputChange} 
        className={`pl-10 text-base bg-white ${className}`} 
        autoComplete="off" 
      />
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-dark h-5 w-5" />
      
      {/* Loading indicator for predictions */}
      {fetchingPredictions && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )}
      
      {/* Predictions dropdown */}
      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {predictions.map(prediction => (
            <div 
              key={prediction.place_id} 
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" 
              onClick={() => {
                onSelectLocation(prediction);
                setShowPredictions(false);
              }}
            >
              {prediction.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutoComplete;
