
import React from "react";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: any[];
  tasksLoading: boolean;
  error?: Error | null;
  futureLocation: {
    name: string;
  };
}

const TaskList: React.FC<TaskListProps> = ({ tasks, tasksLoading, error, futureLocation }) => {
  console.log("TaskList render - loading:", tasksLoading, "tasks length:", tasks?.length);
  
  if (tasksLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="font-medium">Loading available tasks...</p>
        <p className="text-xs text-gray-500 mt-1">Fetching the latest opportunities</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 bg-red-50 rounded-lg shadow-sm border border-red-100">
        <p className="text-red-600 mb-2 font-medium">Error loading tasks</p>
        <p className="text-gray-500 text-sm">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <p className="text-xs text-gray-400 mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <p className="text-gray-600 mb-2 font-medium">
          No tasks found in the database
        </p>
        <p className="text-gray-500 text-sm">
          Try adjusting your search filters or check back later for new opportunities
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} futureLocation={futureLocation} />
      ))}
    </div>
  );
};

export default TaskList;
