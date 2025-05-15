
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TaskStatusBadge from "./TaskStatusBadge";

interface TaskDetailHeaderProps {
  title: string;
  status: string;
  budget: number;
  date: string;
  location: string;
}

export default function TaskDetailHeader({ 
  title, 
  status, 
  budget, 
  date, 
  location 
}: TaskDetailHeaderProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="flex items-center mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      {/* Task Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <div className="flex items-center">
          <TaskStatusBadge status={status} />
        </div>
      </div>
    </>
  );
}
