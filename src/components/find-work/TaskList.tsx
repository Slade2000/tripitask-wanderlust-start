
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
  console.log("TaskList render - loading:", tasksLoading, "tasks:", tasks);
  
  if (tasksLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-2"></div>
        <p>Loading tasks...</p>
        <p className="text-xs text-gray-500 mt-1">Please wait while we fetch tasks</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 bg-red-50 rounded-lg shadow-sm border border-red-100">
        <p className="text-red-600 mb-2">Error loading tasks</p>
        <p className="text-gray-500 text-sm">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <p className="text-gray-600 mb-2">
          No tasks found for your filters.
        </p>
        <p className="text-gray-500 text-sm">
          Try adjusting your search or check back later!
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
