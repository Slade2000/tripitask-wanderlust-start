
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type LocationDateProps = {
  onNext: (data: {
    location: string;
    dueDate: Date | undefined;
    description: string;
  }) => void;
  initialData: {
    location: string;
    dueDate: Date | undefined;
    description: string;
  };
};

const LocationDateStep = ({ onNext, initialData }: LocationDateProps) => {
  const [location, setLocation] = useState(initialData.location);
  const [dueDate, setDueDate] = useState<Date | undefined>(initialData.dueDate);
  const [description, setDescription] = useState(initialData.description);

  const handleNext = () => {
    onNext({ location, dueDate, description });
  };

  const handleCurrentLocation = () => {
    // In a real app, this would use geolocation
    setLocation("Current location (sample)");
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
        <div className="relative">
          <Input
            id="location"
            placeholder="Use current location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10 text-base"
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-dark h-5 w-5" />
        </div>
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleCurrentLocation}
          className="text-xs h-8 mt-1"
        >
          Use current location
        </Button>
      </div>

      <div className="space-y-3">
        <Label className="text-teal-dark">Preferred Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-3">
        <Label htmlFor="description" className="text-teal-dark">
          Describe the Task
        </Label>
        <Textarea
          id="description"
          placeholder="Summarize key details"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[120px] text-base"
        />
      </div>

      <div className="pt-6">
        <Button
          onClick={handleNext}
          className="w-full bg-gold hover:bg-orange text-teal-dark py-6 text-lg"
        >
          NEXT
        </Button>
      </div>
    </div>
  );
};

export default LocationDateStep;
