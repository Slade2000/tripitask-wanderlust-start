
import { CalendarIcon, MapPinIcon, TagIcon, BanknotesIcon } from "lucide-react";

export interface TaskBasicInfoProps {
  category?: string | { name: string, description?: string };
  date: string;
  location: string;
  budget: number | string;
}

export default function TaskBasicInfo({ 
  category, 
  date, 
  location, 
  budget 
}: TaskBasicInfoProps) {
  // Handle category which might be a string or an object
  const categoryName = typeof category === 'object' ? category?.name : category;
  
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {categoryName && (
        <div className="flex items-start">
          <TagIcon className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{categoryName}</p>
          </div>
        </div>
      )}
      
      <div className="flex items-start">
        <CalendarIcon className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-medium">{date}</p>
        </div>
      </div>
      
      <div className="flex items-start">
        <MapPinIcon className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
        <div>
          <p className="text-sm text-gray-500">Location</p>
          <p className="font-medium">{location}</p>
        </div>
      </div>
      
      <div className="flex items-start">
        <BanknotesIcon className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
        <div>
          <p className="text-sm text-gray-500">Budget</p>
          <p className="font-medium">${budget} AUD</p>
        </div>
      </div>
    </div>
  );
}
