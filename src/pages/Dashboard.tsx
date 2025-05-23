
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { getUserTasks } from "@/services/taskService";
import { getProviderOffers } from "@/services/task/offers/queries/getProviderOffers";
import { getProviderEarningsStatistics } from "@/services/earnings";
import BottomNav from "@/components/BottomNav";
import { DashboardLoadingState } from "@/components/dashboard/LoadingState";
import { DashboardError } from "@/components/dashboard/DashboardError";
import { StatCards } from "@/components/dashboard/StatCards";
import { EarningsPanel } from "@/components/dashboard/EarningsPanel";
import { PostedTasksSection } from "@/components/dashboard/PostedTasksSection";
import { WorkingOnSection } from "@/components/dashboard/WorkingOnSection";
import { ReviewsSection } from "@/components/dashboard/ReviewsSection";
import { CompletedTasksSection } from "@/components/dashboard/CompletedTasksSection";
import { getUserReviews } from "@/services/task/reviews";
import { Offer } from "@/types/offer";

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

  // Fetch user's earnings statistics - will be passed to both StatCards and EarningsPanel
  const {
    data: earningsStats,
    isLoading: earningsStatsLoading
  } = useQuery({
    queryKey: ['providerEarningsStats', user?.id],
    queryFn: () => getProviderEarningsStatistics(user?.id || ''),
    enabled: !!user?.id
  });

  // Fetch user's reviews with enhanced error handling
  const {
    data: reviews,
    isLoading: reviewsLoading,
    error: reviewsError
  } = useQuery({
    queryKey: ['userReviews', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.error("Cannot fetch reviews: user ID is undefined");
        return [];
      }
      const result = await getUserReviews(user.id);
      console.log("Reviews fetched for dashboard:", result);
      return result;
    },
    enabled: !!user?.id,
    staleTime: 60000 // 1 minute stale time
  });

  // Enhanced debug logs for reviews data
  console.log("Dashboard reviews data:", reviews);
  console.log("Reviews count:", reviews?.length || 0);
  console.log("Reviews loading state:", reviewsLoading);
  console.log("Reviews error:", reviewsError);

  // Log the offers data and earnings stats to debug
  console.log("Dashboard offers data:", offers);
  console.log("Dashboard earnings stats:", earningsStats);
  console.log("Total earnings value:", earningsStats?.total_earnings);
  console.log("Total earnings type:", typeof earningsStats?.total_earnings);

  // Calculate statistics - all tasks posted by the user
  const activeTasks = tasks?.filter(task => task.status === 'open' || task.status === 'assigned' || task.status === 'in_progress') || [];
  const completedTasks = tasks?.filter(task => task.status === 'completed') || [];

  // Get all pending offers made by the user
  const pendingOffers = offers?.filter(offer => offer.status === 'pending') || [];
  
  // Use actual earnings data if available, otherwise default to 0
  const totalEarnings = Number(earningsStats?.total_earnings) || 0;

  // Format reviews for display with more robust handling
  const formattedReviews = (reviews || []).map(review => ({
    id: review.id,
    customerName: review.reviewer?.full_name || 'Anonymous',
    taskTitle: review.task?.title || 'Task',
    rating: review.rating,
    comment: review.feedback || 'No comment provided'
  }));

  console.log("Formatted reviews for display:", formattedReviews);

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
  if (tasksLoading || offersLoading || earningsStatsLoading || reviewsLoading) {
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

        {/* Earnings Panel Section - Pass the already fetched earningsStats */}
        {user && (
          <EarningsPanel 
            userId={user.id} 
            preloadedStatistics={earningsStats} 
            isLoading={earningsStatsLoading} 
          />
        )}
        
        {/* Completed Tasks Section - For providers to access completed tasks for reviews */}
        {offers && offers.length > 0 && <CompletedTasksSection offers={offers as any} />}
        
        {/* Posted Tasks Section */}
        <PostedTasksSection tasks={tasks || []} />
        
        {/* I Am Working On Section */}
        <WorkingOnSection offers={offers as any} />
        
        {/* Recent Reviews Section - Enhanced with loading state */}
        <ReviewsSection 
          reviews={formattedReviews} 
          isLoading={reviewsLoading}
          error={reviewsError}
        />
      </div>
      
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default Dashboard;
