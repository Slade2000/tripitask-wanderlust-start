
interface TaskStatusBadgeProps {
  status: string;
}

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  // Map "assigned" status to "in_progress" for display
  const displayStatus = status === 'assigned' ? 'in_progress' : status;
  
  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium 
      ${displayStatus === 'open' ? 'bg-teal-100 text-teal-800' : 
      displayStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
      displayStatus === 'completed' ? 'bg-green-100 text-green-800' : 
      'bg-gray-100 text-gray-800'}`
    }>
      {displayStatus === 'open' && 'Open'}
      {displayStatus === 'in_progress' && 'In Progress'}
      {displayStatus === 'completed' && 'Completed'}
      {displayStatus === 'cancelled' && 'Cancelled'}
    </div>
  );
}
