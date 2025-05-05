
import React from "react";
import TaskCard from "./TaskCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";

interface TaskListProps {
  tasks: any[];
  tasksLoading: boolean;
  error?: Error | null;
  futureLocation: {
    name: string;
  };
  onRefresh?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, tasksLoading, error, futureLocation, onRefresh }) => {
  console.log("TaskList render - loading:", tasksLoading, "tasks length:", tasks?.length);
  
  if (tasksLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="font-medium">Loading available tasks...</p>
        <p className="text-xs text-gray-500 mt-1">This might take a moment to connect to the database</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 bg-red-50 rounded-lg shadow-sm border border-red-100">
        <div className="flex items-center justify-center mb-2">
          <AlertCircle className="text-red-500 mr-2 h-5 w-5" />
          <p className="text-red-600 font-medium">Error loading tasks</p>
        </div>
        <p className="text-gray-500 text-sm mb-3">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          className="mt-3 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <p className="text-gray-600 mb-2 font-medium">
          No tasks found matching your criteria
        </p>
        <p className="text-gray-500 text-sm mb-4">
          Try adjusting your search filters or check back later for new opportunities
        </p>
        
        <div className="flex flex-col gap-3 max-w-xs mx-auto text-left text-sm text-gray-500">
          <p className="font-medium">Try these solutions:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Increase the distance radius in the filter settings</li>  
            <li>Try a more general location name (like "Sydney" instead of a specific suburb)</li>
            <li>Check your spelling of location names</li>
            <li>Remove the category filter or try a different category</li>
            <li>Increase your maximum budget filter</li>
            <li>Clear your search terms</li>
          </ul>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          className="mt-6 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Results
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">Found {tasks.length} tasks</p>
        <Button variant="ghost" size="sm" onClick={onRefresh} className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3" /> Refresh
        </Button>
      </div>
      
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} futureLocation={futureLocation} />
      ))}
    </div>
  );
};

export default TaskList;
