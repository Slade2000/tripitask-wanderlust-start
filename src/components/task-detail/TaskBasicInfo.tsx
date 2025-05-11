
import { MapPin, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";

interface TaskBasicInfoProps {
  location: string;
  dueDate: string;
  budget: string;
}

export default function TaskBasicInfo({ location, dueDate, budget }: TaskBasicInfoProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="flex items-center text-gray-600">
        <MapPin className="h-5 w-5 mr-2" />
        <span>{location}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <Calendar className="h-5 w-5 mr-2" />
        <span>Due Date: {formatDate(dueDate)}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <Tag className="h-5 w-5 mr-2" />
        <span>Budget: ${budget}</span>
      </div>
    </div>
  );
}
