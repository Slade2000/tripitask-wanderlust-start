import { MapPin, Calendar, Tag, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface TaskBasicInfoProps {
  budget: string;
  location: string;
  dueDate: string;
  categoryName?: string;
}

export default function TaskBasicInfo({ 
  budget, 
  location, 
  dueDate,
  categoryName
}: TaskBasicInfoProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Task Details</h2>
      <div className="space-y-3">
        <div className="flex items-start">
          <DollarSign className="h-5 w-5 text-teal mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Budget</p>
            <p className="text-gray-700">${budget}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-teal mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Location</p>
            <p className="text-gray-700">{location}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Calendar className="h-5 w-5 text-teal mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Due Date</p>
            <p className="text-gray-700">
              {new Date(dueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        
        {categoryName && (
          <div className="flex items-start">
            <Tag className="h-5 w-5 text-teal mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Category</p>
              <p className="text-gray-700">{categoryName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
