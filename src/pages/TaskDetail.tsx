import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Clock, Tag, User, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useToast } from "@/hooks/use-toast";
import { getTaskById } from "@/services/task/queries/getTaskById";
import { uploadTaskPhotos } from "@/services/task/taskPhotoUpload";
import { useAuth } from "@/contexts/AuthContext";
import { TaskData } from "@/services/task/types";
import { Skeleton } from "@/components/ui/skeleton";

// Import our MessageModal component
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

  // State for the message modal
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={handleBack}>
              Back
            </Button>
          </div>
          <div className="space-y-4">
            <Skeleton className="w-full h-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="w-full h-32" />
              <Skeleton className="w-full h-32" />
            </div>
            <Skeleton className="w-full h-48" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-cream p-4">
        <div className="max-w-3xl mx-auto">
          <Button onClick={handleBack} className="mb-4">
            Back
          </Button>
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-500 font-medium mb-2">Error loading task details</p>
            <p className="text-sm text-gray-500 mb-4">
              {error || "Task not found or has been removed"}
            </p>
            <Button onClick={handleBack}>Go Back</Button>
          </div>
        </div>
      </div>
    );
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
            <h1 className="text-2xl font-bold text-teal mb-4">{task.title}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{task.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Due Date: {formatDate(task.due_date)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Tag className="h-5 w-5 mr-2" />
                <span>Budget: ${task.budget}</span>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Description</h2>
              <p className="text-gray-600">{task.description}</p>
            </div>

            {task.photos && task.photos.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Photos</h2>
                <Carousel className="w-full">
                  <CarouselContent>
                    {task.photos.map((photo, index) => (
                      <CarouselItem key={index}>
                        <img
                          src={photo}
                          alt={`Task Photo ${index + 1}`}
                          className="object-cover rounded-md w-full h-64"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            )}

            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Task Poster</h2>
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name as string} />
                  <AvatarFallback>{user?.user_metadata?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-gray-800 font-semibold">{user?.user_metadata?.name}</div>
                </div>
              </div>
            </div>

            {task && isProviderPage && task.status === "open" && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => navigate(`/tasks/${taskId}/submit-offer`)}
                  className="w-full bg-teal hover:bg-teal-dark"
                >
                  Submit Offer
                </Button>
                <Button
                  onClick={() => setMessageModalOpen(true)}
                  variant="outline"
                  className="border-teal text-teal hover:bg-teal/10"
                >
                  Ask Questions
                </Button>
              </div>
            )}
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
