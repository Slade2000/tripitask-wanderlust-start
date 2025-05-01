
import { useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTasks } from "@/services/taskService";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarClock, MapPin, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const MyJobs = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['userTasks', user?.id],
    queryFn: () => getUserTasks(user?.id || ''),
    enabled: !!user?.id
  });
  
  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">
          My Tasks
        </h1>
        
        {isLoading && (
          <div className="text-center p-6">
            <p>Loading your tasks...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 p-6 rounded-lg shadow-md text-center">
            <p className="text-red-700">Error loading tasks. Please try again.</p>
          </div>
        )}
        
        {!isLoading && tasks && tasks.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">
              You haven't posted any tasks yet. Create one to get started!
            </p>
          </div>
        )}
        
        {tasks && tasks.length > 0 && (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-teal-dark">{task.title}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div className="flex items-center text-gray-600">
                        <DollarSign size={18} className="mr-2" />
                        <span>Budget: ${task.budget}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <MapPin size={18} className="mr-2" />
                        <span>{task.location}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <CalendarClock size={18} className="mr-2" />
                        <span>Due: {format(new Date(task.due_date), 'dd MMM yyyy')}</span>
                      </div>
                      
                      <div className="bg-teal-100 text-teal-800 rounded-full px-3 py-1 text-sm inline-flex items-center w-fit">
                        Status: {task.status}
                      </div>
                    </div>
                    
                    <p className="mt-3 text-gray-700 line-clamp-2">{task.description}</p>
                    
                    <div className="mt-4 flex justify-end">
                      <button className="text-teal bg-white border border-teal rounded px-4 py-2 hover:bg-teal hover:text-white transition-colors">
                        View Details
                      </button>
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
