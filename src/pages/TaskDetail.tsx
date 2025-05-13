
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useTaskDetail } from "@/hooks/useTaskDetail";
import TaskDetailView from "@/components/task-detail/TaskDetailView";
import TaskDetailLoading from "@/components/task-detail/TaskDetailLoading";
import TaskDetailError from "@/components/task-detail/TaskDetailError";

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    task, 
    offers, 
    loading, 
    error, 
    isTaskPoster,
    hasAcceptedOffer,
    isMessageModalOpen,
    handleOpenMessageModal,
    handleCloseMessageModal,
    handleTaskUpdated,
    refreshOffers
  } = useTaskDetail(taskId, user);

  useEffect(() => {
    // When component mounts, scroll to top
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return <TaskDetailLoading onBack={() => navigate(-1)} />;
  }

  if (error || !task) {
    return <TaskDetailError error={error || "Task not found"} onBack={() => navigate(-1)} />;
  }

  return (
    <TaskDetailView
      task={task}
      offers={offers}
      isTaskPoster={isTaskPoster}
      hasAcceptedOffer={hasAcceptedOffer}
      isMessageModalOpen={isMessageModalOpen}
      onOpenMessageModal={handleOpenMessageModal}
      onCloseMessageModal={handleCloseMessageModal}
      onTaskUpdated={handleTaskUpdated}
      onRefreshOffers={refreshOffers}
    />
  );
};

export default TaskDetail;
