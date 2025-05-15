
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TaskCard } from "../TaskCard";

interface FilteredTasksProps {
  tasks: any[];
  type: 'all' | 'open' | 'in-progress' | 'completed';
}

export const FilteredTasks = ({ tasks, type }: FilteredTasksProps) => {
  const navigate = useNavigate();
  
  // Show only first 3 tasks
  const displayedTasks = tasks.slice(0, 3);
  
  return (
    <div className="space-y-3">
      {displayedTasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
      
      {tasks.length > 3 && (
        <div className="text-center">
          <Button 
            variant="ghost" 
            className="text-teal" 
            onClick={() => navigate('/my-jobs')}
          >
            View All ({tasks.length}) {type === 'all' ? 'Tasks' : 
              type === 'open' ? 'Open Tasks' : 
              type === 'in-progress' ? 'In Progress Tasks' : 
              'Completed Tasks'}
          </Button>
        </div>
      )}
    </div>
  );
};
