
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TaskCard } from "./TaskCard";
import { EmptyStateCard, EmptyTasksCard } from "./EmptyStates";

interface TasksTabContentProps {
  tasks: any[];
  type: 'all' | 'open' | 'in-progress' | 'completed';
  navigate: any;
}

export const TasksTabContent = ({ tasks, type, navigate }: TasksTabContentProps) => {
  let filteredTasks: any[] = [];
  let emptyMessage = "";
  
  switch (type) {
    case 'all':
      filteredTasks = tasks || [];
      break;
    case 'open':
      filteredTasks = tasks?.filter(task => task.status === 'open') || [];
      emptyMessage = "No open tasks yet.";
      break;
    case 'in-progress':
      filteredTasks = tasks?.filter(task => task.status === 'assigned' || task.status === 'in_progress') || [];
      emptyMessage = "No tasks in progress.";
      break;
    case 'completed':
      filteredTasks = tasks?.filter(task => task.status === 'completed') || [];
      emptyMessage = "No completed tasks yet.";
      break;
  }
  
  if (type === 'all' && (!filteredTasks || filteredTasks.length === 0)) {
    return <EmptyTasksCard />;
  }
  
  if (!filteredTasks || filteredTasks.length === 0) {
    return <EmptyStateCard message={emptyMessage} />;
  }

  return (
    <div className="space-y-3">
      {filteredTasks.slice(0, 3).map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
      {filteredTasks.length > 3 && (
        <div className="text-center">
          <Button 
            variant="ghost" 
            className="text-teal" 
            onClick={() => navigate('/my-jobs')}
          >
            View All ({filteredTasks.length}) {type === 'all' ? 'Tasks' : 
              type === 'open' ? 'Open Tasks' : 
              type === 'in-progress' ? 'In Progress Tasks' : 
              'Completed Tasks'}
          </Button>
        </div>
      )}
    </div>
  );
};
