
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TaskCardProps {
  task: any;
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const navigate = useNavigate();
  
  // Determine the right status badge
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'assigned':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'pending_complete':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'completed':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Get display text for status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'assigned':
      case 'in_progress':
        return 'In Progress';
      case 'pending_complete':
        return 'Pending Approval';
      case 'completed':
        return 'Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Card 
      key={task.id} 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-teal-dark">{task.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Due: {format(new Date(task.due_date), 'dd MMM yyyy')}
            </p>
          </div>
          <Badge className={getBadgeStyle(task.status)}>
            {getStatusText(task.status)}
          </Badge>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm">
          <Clock size={14} className="mr-1" />
          <span>{task.offer_count || 0} offers</span>
        </div>
      </CardContent>
    </Card>
  );
};
