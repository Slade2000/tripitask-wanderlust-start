
import { useNavigate } from "react-router-dom";
import TaskStatusBadge from "./TaskStatusBadge";

interface TaskDetailHeaderProps {
  title: string;
  status: string;
  budget: number | string;
  date: string;
  location: string;
}

export default function TaskDetailHeader({ title, status, budget, date, location }: TaskDetailHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <button
        onClick={() => navigate(-1)}
        className="text-teal hover:text-teal-dark mb-4"
      >
        &larr; Back
      </button>
      <h1 className="text-3xl font-bold text-teal mb-2">{title}</h1>
      <TaskStatusBadge status={status} />
    </div>
  );
}
