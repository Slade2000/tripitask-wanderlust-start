
import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useTaskDetail } from "@/hooks/useTaskDetail";
import TaskDetailView from "@/components/task-detail/TaskDetailView";
import TaskDetailLoading from "@/components/task-detail/TaskDetailLoading";
import TaskDetailError from "@/components/task-detail/TaskDetailError";
import BottomNav from "@/components/BottomNav";

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const { 
    task, 
    loading, 
    error, 
    isTaskPoster,
    hasAcceptedOffer,
    isMessageModalOpen,
    handleOpenMessageModal,
    handleCloseMessageModal,
    handleTaskUpdated,
  } = useTaskDetail(taskId, user);

  useEffect(() => {
    // When component mounts, scroll to top
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Debug logging for task status
    if (task) {
      console.log("TaskDetail received task with status:", task.status);
    }
  }, [task]);

  if (loading) {
    return (
      <>
        <TaskDetailLoading onBack={() => navigate(-1)} />
        <BottomNav currentPath={location.pathname} />
      </>
    );
  }

  if (error || !task) {
    return (
      <>
        <TaskDetailError error={error || "Task not found"} onBack={() => navigate(-1)} />
        <BottomNav currentPath={location.pathname} />
      </>
    );
  }

  return (
    <>
      <TaskDetailView
        task={task}
        offers={[]} // Pass empty array since offers section is removed
        isTaskPoster={isTaskPoster}
        hasAcceptedOffer={hasAcceptedOffer}
        isMessageModalOpen={isMessageModalOpen}
        onOpenMessageModal={handleOpenMessageModal}
        onCloseMessageModal={handleCloseMessageModal}
        onTaskUpdated={handleTaskUpdated}
        onRefreshOffers={async () => {}} // Empty function since offers section is removed
      />
      <BottomNav currentPath={location.pathname} />
    </>
  );
};

export default TaskDetail;
