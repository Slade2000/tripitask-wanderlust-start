
import TaskBasicInfo from "./TaskBasicInfo";
import TaskDescription from "./TaskDescription";
import TaskImageGallery from "./TaskImageGallery";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskReviewSection from "./TaskReviewSection";

interface TaskDetailMainProps {
  task: any;
  isTaskPoster: boolean;
  providerDetails: any;
}

export default function TaskDetailMain({
  task,
  isTaskPoster,
  providerDetails
}: TaskDetailMainProps) {
  return (
    <div className="md:col-span-2 space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Task Details</h3>
          <TaskStatusBadge status={task.status} />
        </div>

        <TaskBasicInfo
          category={task.category}
          date={task.date}
          location={task.location}
          budget={task.budget}
        />
        
        <TaskDescription description={task.description} />

        {task.photos && task.photos.length > 0 && (
          <TaskImageGallery photos={task.photos} />
        )}
      </div>

      {/* Review Section (only visible after task is completed) */}
      {task.status === 'completed' && (
        <TaskReviewSection 
          task={task}
          isTaskPoster={isTaskPoster}
          providerDetails={providerDetails}
        />
      )}
    </div>
  );
}
