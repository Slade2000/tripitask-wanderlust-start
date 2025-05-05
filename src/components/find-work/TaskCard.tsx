
import React from "react";
import { format } from "date-fns";
import { DollarSign, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    budget: string;
    location: string;
    due_date: string;
    categories?: {
      name: string;
    } | null;
  };
  futureLocation?: {
    name: string;
  };
}

const TaskCard: React.FC<TaskCardProps> = ({ task, futureLocation }) => {
  return (
    <Card key={task.id} className="overflow-hidden">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium">{task.title}</h3>
        
        <div className="flex flex-wrap gap-y-2 mt-2 text-sm text-gray-600">
          <div className="flex items-center w-1/2">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>${task.budget}</span>
          </div>
          
          <div className="flex items-center w-1/2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{task.location}</span>
            
            {futureLocation?.name && 
             task.location.toLowerCase().includes(futureLocation.name.toLowerCase()) && (
              <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                You'll be here soon!
              </span>
            )}
          </div>
          
          <div className="flex items-center w-1/2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Due: {format(new Date(task.due_date), "PP")}</span>
          </div>
          
          {task.categories && (
            <div className="flex items-center w-1/2">
              <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                {task.categories.name}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full" asChild>
          <Link to={`/tasks/${task.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
