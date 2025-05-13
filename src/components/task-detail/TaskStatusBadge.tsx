
interface TaskStatusBadgeProps {
  status: string;
}

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium 
      ${status === 'open' ? 'bg-teal-100 text-teal-800' : 
      status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
      status === 'completed' ? 'bg-green-100 text-green-800' : 
      'bg-gray-100 text-gray-800'}`
    }>
      {status === 'open' && 'Open'}
      {status === 'in_progress' && 'In Progress'}
      {status === 'completed' && 'Completed'}
      {status === 'cancelled' && 'Cancelled'}
    </div>
  );
}
