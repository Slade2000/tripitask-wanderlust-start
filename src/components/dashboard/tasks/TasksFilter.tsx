
interface TasksFilterProps {
  tasks: any[];
  type: 'all' | 'open' | 'in-progress' | 'completed';
}

export const filterTasks = ({ tasks, type }: TasksFilterProps): any[] => {
  if (!tasks || tasks.length === 0) {
    return [];
  }
  
  switch (type) {
    case 'all':
      return tasks;
    case 'open':
      return tasks.filter(task => task.status === 'open') || [];
    case 'in-progress':
      return tasks.filter(task => task.status === 'assigned' || task.status === 'in_progress') || [];
    case 'completed':
      return tasks.filter(task => task.status === 'completed') || [];
    default:
      return [];
  }
};

export const getEmptyMessage = (type: 'all' | 'open' | 'in-progress' | 'completed'): string => {
  switch (type) {
    case 'open':
      return "No open tasks yet.";
    case 'in-progress':
      return "No tasks in progress.";
    case 'completed':
      return "No completed tasks yet.";
    default:
      return "";
  }
};
