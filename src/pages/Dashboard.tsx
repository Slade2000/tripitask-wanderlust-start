
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTasks } from "@/services/taskService";
import { getProviderOffers } from "@/services/task/offers/queries/getProviderOffers";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { DashboardLoadingState } from "@/components/dashboard/LoadingState";
import { StatCards } from "@/components/dashboard/StatCards";
import { TasksTabContent } from "@/components/dashboard/TasksTabContent";
import { JobsTabContent } from "@/components/dashboard/JobsTabContent";
import { ReviewCard } from "@/components/dashboard/ReviewCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Fetch user's tasks
  const {
    data: tasks,
    isLoading: tasksLoading
  } = useQuery({
    queryKey: ['userTasks', user?.id],
    queryFn: () => getUserTasks(user?.id || ''),
    enabled: !!user?.id
  });

  // Fetch user's offers
  const {
    data: offers,
    isLoading: offersLoading
  } = useQuery({
    queryKey: ['providerOffers', user?.id],
    queryFn: () => getProviderOffers(user?.id || ''),
    enabled: !!user?.id
  });

  // Calculate statistics - all tasks posted by the user
  const activeTasks = tasks?.filter(task => task.status === 'open' || task.status === 'assigned') || [];
  const completedTasks = tasks?.filter(task => task.status === 'completed') || [];

  // Get all pending offers made by the user
  const pendingOffers = offers?.filter(offer => offer.status === 'pending') || [];
  
  // Get accepted offers where the user is the service provider
  const acceptedOffers = offers?.filter(offer => offer.status === 'accepted') || [];

  // Mock data for earnings (replace with real data once available)
  const totalEarnings = 3250;

  // Mock data for reviews (replace with real data once available)
  const recentReviews = [
    {
      id: '1',
      customerName: 'John Smith',
      taskTitle: 'Moving Furniture',
      rating: 5,
      comment: 'Great work! Very professional and on time.'
    },
    {
      id: '2',
      customerName: 'Sarah Johnson',
      taskTitle: 'House Cleaning',
      rating: 4,
      comment: 'Did a thorough job, would hire again for sure.'
    }
  ];

  // Loading state
  if (tasksLoading || offersLoading) {
    return (
      <div className="min-h-screen bg-cream p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-teal mb-6 text-center">Dashboard</h1>
          <DashboardLoadingState />
        </div>
        <BottomNav currentPath={location.pathname} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">My Dashboard</h1>
        
        {/* Key Stats Section */}
        <StatCards 
          activeTasks={activeTasks} 
          pendingOffers={pendingOffers} 
          completedTasks={completedTasks} 
          totalEarnings={totalEarnings} 
        />
        
        {/* Posted Tasks Section with Tabs */}
        <h2 className="text-xl font-semibold text-teal-dark mb-3">My Posted Tasks</h2>
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="bg-white mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <TasksTabContent tasks={tasks} type="all" navigate={navigate} />
          </TabsContent>
          
          <TabsContent value="open" className="mt-0">
            <TasksTabContent tasks={tasks} type="open" navigate={navigate} />
          </TabsContent>
          
          <TabsContent value="in-progress" className="mt-0">
            <TasksTabContent tasks={tasks} type="in-progress" navigate={navigate} />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            <TasksTabContent tasks={tasks} type="completed" navigate={navigate} />
          </TabsContent>
        </Tabs>
        
        {/* I Am Working On Section with Tabs */}
        <h2 className="text-xl font-semibold text-teal-dark mb-3">I Am Working On</h2>
        <Tabs defaultValue="active-jobs" className="mb-6">
          <TabsList className="bg-white mb-4">
            <TabsTrigger value="active-jobs">Active Jobs</TabsTrigger>
            <TabsTrigger value="offers-made">Offers Made</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active-jobs" className="mt-0">
            <JobsTabContent offers={offers} type="active-jobs" />
          </TabsContent>
          
          <TabsContent value="offers-made" className="mt-0">
            <JobsTabContent offers={offers} type="offers-made" />
          </TabsContent>
        </Tabs>
        
        {/* Recent Reviews Section */}
        <h2 className="text-xl font-semibold text-teal-dark mb-3">Recent Reviews</h2>
        {recentReviews.length > 0 ? (
          <div className="mb-6 grid gap-3 grid-cols-1 md:grid-cols-2">
            {recentReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-4 text-center">
              <p className="text-gray-600">No reviews yet. Complete jobs to get reviews!</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default Dashboard;
