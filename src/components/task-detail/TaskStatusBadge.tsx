
interface TaskStatusBadgeProps {
  status: string;
}

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  // Log the incoming status for debugging
  console.log("TaskStatusBadge received status:", status);

  // Normalize the status for display
  const getDisplayStatus = (rawStatus: string): string => {
    const statusMap: Record<string, string> = {
      'assigned': 'In Progress',
      'open': 'Open',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    
    return statusMap[rawStatus.toLowerCase()] || 'Unknown';
  };
  
  // Get the appropriate CSS classes based on status
  const getStatusClasses = (rawStatus: string): string => {
    const status = rawStatus.toLowerCase();
    
    if (status === 'open') {
      return 'bg-teal-100 text-teal-800';
    } else if (status === 'assigned' || status === 'in_progress') {
      return 'bg-blue-100 text-blue-800';
    } else if (status === 'completed') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'cancelled') {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };
  
  const displayText = getDisplayStatus(status);
  const statusClasses = getStatusClasses(status);

  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses}`}>
      {displayText}
    </div>
  );
}
