
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getTaskById } from "@/services/task/queries/getTaskById";
import { useAuth } from "@/contexts/AuthContext";
import { TaskData } from "@/services/task/types";

// Import our components
import TaskBasicInfo from "@/components/task-detail/TaskBasicInfo";
import TaskDescription from "@/components/task-detail/TaskDescription";
import TaskImageGallery from "@/components/task-detail/TaskImageGallery";
import TaskPosterInfo from "@/components/task-detail/TaskPosterInfo";
import TaskActionButtons from "@/components/task-detail/TaskActionButtons";
import TaskDetailLoading from "@/components/task-detail/TaskDetailLoading";
import TaskDetailError from "@/components/task-detail/TaskDetailError";
import MessageModal from "@/components/messages/MessageModal";

export default function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProviderPage, setIsProviderPage] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError(null);

      if (!taskId) {
        setError("Task ID is missing");
        setLoading(false);
        return;
      }

      try {
        const taskData = await getTaskById(taskId);
        if (taskData) {
          // Transform task_photos array into photos array of URLs
          const transformedTask: TaskData = {
            ...taskData,
            photos: taskData.task_photos?.map(photo => photo.photo_url) || []
          };
          setTask(transformedTask);
        } else {
          setError("Task not found");
          toast({
            title: "Error",
            description: "Task not found",
            variant: "destructive",
          });
          navigate("/my-jobs");
        }
      } catch (error) {
        console.error("Error loading task:", error);
        setError("Failed to load task");
        toast({
          title: "Error",
          description: "Failed to load task",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
    setIsProviderPage(window.location.pathname.startsWith('/tasks/') && user?.id !== task?.user_id);
  }, [taskId, navigate, toast, user?.id, task?.user_id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <TaskDetailLoading onBack={handleBack} />;
  }

  if (error || !task) {
    return <TaskDetailError error={error} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={handleBack}>
            Back
          </Button>
        </div>

        <Card className="bg-white shadow-md rounded-md overflow-hidden">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-teal mb-4">{task?.title}</h1>

            <TaskBasicInfo 
              location={task.location} 
              dueDate={task.due_date} 
              budget={task.budget} 
            />

            <TaskDescription description={task.description} />
            
            <TaskImageGallery photos={task.photos || []} />
            
            <TaskPosterInfo user={user} />
            
            <TaskActionButtons
              taskId={taskId || ''}
              isProviderPage={isProviderPage}
              taskStatus={task.status || 'open'}
              onMessageClick={() => setMessageModalOpen(true)}
            />
          </CardContent>
        </Card>
        
        {task && (
          <MessageModal
            isOpen={messageModalOpen}
            onClose={() => setMessageModalOpen(false)}
            taskId={taskId || ''}
            taskOwnerId={task.user_id}
            taskTitle={task.title}
          />
        )}
      </div>
    </div>
  );
}
