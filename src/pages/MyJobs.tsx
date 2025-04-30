
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getUserTasks } from "@/services/taskService";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const MyJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate("/login", { state: { from: "/my-jobs" } });
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const userTasks = await getUserTasks();
        setTasks(userTasks || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load your tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-amber-500 text-white';
      case 'assigned':
        return 'bg-blue-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-teal">My Tasks</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate("/post-task")}
          className="bg-gold hover:bg-orange text-teal-dark"
        >
          Post a New Task
        </Button>
      </header>
      
      <div className="mb-20">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 text-teal animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-teal-dark mb-4">
              No tasks yet
            </h2>
            <p className="text-teal-dark mb-6">
              You haven't posted any tasks. Create your first task to get started!
            </p>
            <Button 
              onClick={() => navigate("/post-task")}
              className="bg-gold hover:bg-orange text-teal-dark"
            >
              Post a Task
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className="border-teal-light overflow-hidden">
                <CardHeader className="bg-teal/10 py-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-teal-dark">{task.title}</CardTitle>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {task.budget && (
                      <div>
                        <span className="font-medium">Budget:</span> ${task.budget}
                      </div>
                    )}
                    {task.location && (
                      <div>
                        <span className="font-medium">Location:</span> {task.location}
                      </div>
                    )}
                    {task.due_date && (
                      <div>
                        <span className="font-medium">Due:</span> {format(new Date(task.due_date), "PPP")}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Posted:</span> {format(new Date(task.created_at), "PPP")}
                    </div>
                  </div>
                  
                  {task.task_photos && task.task_photos.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2 mt-1">
                        {task.task_photos.map((photo: any) => (
                          <div key={photo.id} className="w-16 h-16 rounded-md overflow-hidden">
                            <img
                              src={photo.photo_url}
                              alt="Task"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav currentPath="/my-jobs" />
    </div>
  );
};

export default MyJobs;
