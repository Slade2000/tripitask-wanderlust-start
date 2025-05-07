
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  buttonClassName?: string;
  placeholder?: string;
}

const DatePicker = ({ 
  date, 
  onDateSelect, 
  buttonClassName,
  placeholder = "Pick a date" 
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    onDateSelect(date);
    setOpen(false); // Close calendar when date is selected
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("w-full justify-start text-left font-normal bg-white", 
            !date && "text-muted-foreground",
            buttonClassName
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar 
          mode="single" 
          selected={date} 
          onSelect={handleDateSelect} 
          initialFocus 
          className={cn("p-3 pointer-events-auto")} 
          disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))} 
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
