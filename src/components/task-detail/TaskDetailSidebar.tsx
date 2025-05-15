
import { Button } from "@/components/ui/button";
import TaskPosterInfo from "./TaskPosterInfo";
import TaskActionSection from "./TaskActionSection";

interface TaskDetailSidebarProps {
  task: any;
  offers: any[];
  isTaskPoster: boolean;
  onOpenMessageModal: () => void;
  onTaskUpdated: (task: any) => void;
  hasAcceptedOffer: boolean;
  isCurrentUserProvider: boolean;
  user: any;
}

export default function TaskDetailSidebar({
  task,
  offers,
  isTaskPoster,
  onOpenMessageModal,
  onTaskUpdated,
  hasAcceptedOffer,
  isCurrentUserProvider,
  user
}: TaskDetailSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Task Poster Info */}
      <TaskPosterInfo
        userId={task.user_id}
        taskId={task.id}
        name={task.poster_name}
        rating={task.poster_rating}
        memberSince={task.poster_member_since}
        location={task.poster_location}
        avatar={task.poster_avatar}
      />

      {/* Task Actions */}
      {user && (
        <TaskActionSection
          task={task}
          offers={offers}
          isTaskPoster={isTaskPoster}
          onOpenMessageModal={onOpenMessageModal}
          onTaskUpdated={onTaskUpdated}
          hasAcceptedOffer={hasAcceptedOffer}
          isCurrentUserProvider={isCurrentUserProvider}
        />
      )}
    </div>
  );
}
