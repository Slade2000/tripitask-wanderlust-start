
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTasks } from "@/services/taskService";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TaskPhoto {
  id: string;
  task_id: string;
  photo_url: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  budget: string;
  location: string;
  created_at: string;
  user_id: string;
  due_date: string;
  status: string;
  task_photos: TaskPhoto[];
}

const MyJobs = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      if (!user) return;
      
      try {
        const userTasks = await getUserTasks(user.id);
        setTasks(userTasks as Task[]);
      } catch (error) {
        console.error("Error loading tasks:", error);
        toast.error("Failed to load your tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-4 flex justify-center items-center">
        <div className="text-xl text-teal">Loading your tasks...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="min-h-screen bg-cream p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-teal mb-6">My Tasks</h1>
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-lg mb-4">You haven't posted any tasks yet.</p>
            <Button
              className="bg-teal hover:bg-teal-dark text-white"
              onClick={() => window.location.href = "/post-task"}
            >
              Post Your First Task
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6">My Tasks</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {tasks.map((task) => (
            <Card key={task.id} className="overflow-hidden">
              {task.task_photos && task.task_photos.length > 0 ? (
                <div className="h-48 overflow-hidden">
                  <img
                    src={task.task_photos[0].photo_url}
                    alt={task.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400">No image available</p>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-teal">{task.title}</CardTitle>
                <CardDescription>
                  Posted {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>Budget: ${task.budget}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{task.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 mt-2 line-clamp-2">{task.description}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="bg-gold hover:bg-orange text-teal-dark w-full"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyJobs;
