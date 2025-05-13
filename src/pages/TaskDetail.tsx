
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getTaskById } from "@/services/task/queries/getTaskById";
import TaskBasicInfo from "@/components/task-detail/TaskBasicInfo";
import TaskDescription from "@/components/task-detail/TaskDescription";
import TaskImageGallery from "@/components/task-detail/TaskImageGallery";
import TaskPosterInfo from "@/components/task-detail/TaskPosterInfo";
import TaskActionButtons from "@/components/task-detail/TaskActionButtons";
import TaskDetailLoading from "@/components/task-detail/TaskDetailLoading";
import TaskDetailError from "@/components/task-detail/TaskDetailError";
import { Button } from "@/components/ui/button";
import { MessageModal } from "@/components/messages/MessageModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isTaskPoster, setIsTaskPoster] = useState(false);
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      
      setLoading(true);
      try {
        const taskData = await getTaskById(taskId);
        
        if (taskData) {
          setTask(taskData);
          // Check if the current user is the task poster
          setIsTaskPoster(user?.id === taskData.user_id);
        } else {
          setError("Task not found");
        }
      } catch (err) {
        console.error("Error fetching task:", err);
        setError("Error loading task. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, user?.id]);

  const handleOpenMessageModal = () => {
    if (!user) {
      toast.error("Please sign in to send messages");
      navigate("/login");
      return;
    }
    
    setIsMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setIsMessageModalOpen(false);
  };
  
  const handleCompleteTask = async () => {
    if (!taskId || !user || !isTaskPoster) return;
    
    setIsSubmittingCompletion(true);
    try {
      // Update task status to completed
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', taskId)
        .eq('user_id', user.id); // Ensure the user is the task poster
        
      if (error) {
        throw error;
      }
      
      toast.success("Task marked as completed!");
      
      // Refresh task data
      const updatedTask = await getTaskById(taskId);
      if (updatedTask) {
        setTask(updatedTask);
      }
    } catch (err) {
      console.error("Error completing task:", err);
      toast.error("Error marking task as completed");
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  if (loading) {
    return <TaskDetailLoading />;
  }

  if (error || !task) {
    return <TaskDetailError error={error || "Task not found"} />;
  }

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-teal hover:text-teal-dark mb-4"
          >
            &larr; Back
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-teal">{task.title}</h1>
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
              {task.status === 'open' && 'Open'}
              {task.status === 'in_progress' && 'In Progress'}
              {task.status === 'completed' && 'Completed'}
              {task.status === 'cancelled' && 'Cancelled'}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {task.task_photos && task.task_photos.length > 0 && (
              <TaskImageGallery photos={task.task_photos.map((p: any) => p.photo_url)} />
            )}
            
            <TaskBasicInfo
              budget={task.budget}
              location={task.location}
              dueDate={task.due_date}
              category={task.categories?.name}
            />
            
            <TaskDescription description={task.description} />
            
            {task.status === 'open' && user?.id !== task.user_id && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Interested in this task?</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => navigate(`/tasks/${taskId}/submit-offer`)}
                    className="bg-teal hover:bg-teal-dark"
                  >
                    Submit an Offer
                  </Button>
                  <Button
                    onClick={handleOpenMessageModal}
                    variant="outline"
                    className="border-teal text-teal hover:bg-teal/10"
                  >
                    Ask a Question
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <TaskPosterInfo
              userId={task.user_id}
              taskerId={task.user_id}
              taskId={task.id}
            />
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <TaskActionButtons
                taskId={task.id}
                isProviderPage={!isTaskPoster}
                taskStatus={task.status}
                isTaskPoster={isTaskPoster}
                onMessageClick={handleOpenMessageModal}
                onCompleteTask={handleCompleteTask}
              />
            </div>
          </div>
        </div>
      </div>
      
      {isMessageModalOpen && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={handleCloseMessageModal}
          taskId={task.id}
          receiverId={task.user_id}
        />
      )}
    </div>
  );
};

export default TaskDetail;
