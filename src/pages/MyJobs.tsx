
import { useLocation, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTasks } from "@/services/taskService";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarClock, MapPin, DollarSign, Users, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const MyJobs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    data: tasks,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['userTasks', user?.id],
    queryFn: () => getUserTasks(user?.id || ''),
    enabled: !!user?.id,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    meta: {
      onSuccess: (data) => {
        console.log("Tasks loaded successfully:", data?.length || 0);
      },
      onError: (error) => {
        console.error("Error in tasks query:", error);
        toast({
          title: "Error loading tasks",
          description: error instanceof Error ? error.message : "Unknown error, please try again later",
          variant: "destructive",
        });
      }
    }
  });

  const handleRefresh = () => {
    toast({
      title: "Refreshing tasks...",
      duration: 2000,
    });
    refetch();
  };
  
  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">
          My Tasks
        </h1>
        
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4 mb-4" />
                  <div className="flex flex-wrap gap-6">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-6 rounded-lg shadow-md text-center">
            <p className="text-red-700 mb-2">Error loading tasks: {error instanceof Error ? error.message : "Unknown error"}</p>
            <Button 
              variant="outline"
              onClick={handleRefresh}
              className="mt-2 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          </div>
        )}
        
        {!isLoading && !error && tasks && tasks.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600 mb-4">
              You haven't posted any tasks yet. Create one to get started!
            </p>
            <Button 
              onClick={() => navigate("/post-task")}
              className="bg-teal hover:bg-teal-dark text-white"
            >
              Post a New Task
            </Button>
          </div>
        )}
        
        {!isLoading && !error && tasks && tasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh} 
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </Button>
            </div>
            
            {tasks.map((task) => (
              <Card 
                key={task.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <CardContent className="p-0">
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-teal-dark">{task.title}</h2>
                    
                    <Badge className={`mt-1 ${
                      task.status === 'open' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                        : task.status === 'assigned' 
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                    }`}>
                      {task.status}
                    </Badge>
                    
                    <div className="flex flex-wrap gap-6 mt-3">
                      <div className="flex items-center text-gray-600">
                        <DollarSign size={18} className="mr-2" />
                        <span>${task.budget}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <CalendarClock size={18} className="mr-2" />
                        <span>{format(new Date(task.due_date), 'dd MMM yyyy')}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <MapPin size={18} className="mr-2" />
                        <span>{task.location}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center text-gray-600">
                      <Users size={18} className="mr-2" />
                      <span>{task.offer_count || 0} offers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default MyJobs;
