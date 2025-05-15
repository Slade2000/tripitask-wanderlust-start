
import { EmptyStateCard, EmptyTasksCard } from "./EmptyStates";
import { FilteredTasks } from "./tasks/FilteredTasks";
import { filterTasks, getEmptyMessage } from "./tasks/TasksFilter";

interface TasksTabContentProps {
  tasks: any[];
  type: 'all' | 'open' | 'in-progress' | 'completed';
  navigate: any;
}

export const TasksTabContent = ({ tasks, type }: TasksTabContentProps) => {
  const filteredTasks = filterTasks({ tasks, type });
  const emptyMessage = getEmptyMessage(type);
  
  // Show empty tasks card if there are no tasks at all
  if (type === 'all' && (!filteredTasks || filteredTasks.length === 0)) {
    return <EmptyTasksCard />;
  }
  
  // Show empty state with custom message for specific tabs
  if (!filteredTasks || filteredTasks.length === 0) {
    return <EmptyStateCard message={emptyMessage} />;
  }

  return <FilteredTasks tasks={filteredTasks} type={type} />;
};
