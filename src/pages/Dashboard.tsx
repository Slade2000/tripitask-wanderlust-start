
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTasks } from "@/services/taskService";
import { getProviderOffers } from "@/services/task/offers/queries/getProviderOffers";
import BottomNav from "@/components/BottomNav";
import { DashboardLoadingState } from "@/components/dashboard/LoadingState";
import { DashboardError } from "@/components/dashboard/DashboardError";
import { StatCards } from "@/components/dashboard/StatCards";
import { EarningsPanel } from "@/components/dashboard/EarningsPanel";
import { PostedTasksSection } from "@/components/dashboard/PostedTasksSection";
import { WorkingOnSection } from "@/components/dashboard/WorkingOnSection";
import { ReviewsSection } from "@/components/dashboard/ReviewsSection";

const Dashboard = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Fetch user's tasks
  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError
  } = useQuery({
    queryKey: ['userTasks', user?.id],
    queryFn: () => getUserTasks(user?.id || ''),
    enabled: !!user?.id
  });

  // Fetch user's offers with task data included
  const {
    data: offers,
    isLoading: offersLoading,
    error: offersError
  } = useQuery({
    queryKey: ['providerOffers', user?.id],
    queryFn: () => getProviderOffers(user?.id || ''),
    enabled: !!user?.id
  });

  // Log the offers data to debug task status issues
  console.log("Dashboard offers data:", offers);

  // Calculate statistics - all tasks posted by the user
  const activeTasks = tasks?.filter(task => task.status === 'open' || task.status === 'assigned' || task.status === 'in_progress') || [];
  const completedTasks = tasks?.filter(task => task.status === 'completed') || [];

  // Get all pending offers made by the user
  const pendingOffers = offers?.filter(offer => offer.status === 'pending') || [];
  
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

  // Show error state if both data fetching operations failed
  if ((tasksError || offersError) && !tasksLoading && !offersLoading) {
    return (
      <div className="min-h-screen bg-cream p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-teal mb-6 text-center">Dashboard</h1>
          <DashboardError tasksError={tasksError} offersError={offersError} />
        </div>
        <BottomNav currentPath={location.pathname} />
      </div>
    );
  }

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

        {/* Earnings Panel Section */}
        {user && <EarningsPanel userId={user.id} />}
        
        {/* Posted Tasks Section */}
        <PostedTasksSection tasks={tasks || []} />
        
        {/* I Am Working On Section */}
        <WorkingOnSection offers={offers} />
        
        {/* Recent Reviews Section */}
        <ReviewsSection reviews={recentReviews} />
      </div>
      
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default Dashboard;
