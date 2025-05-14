import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Activity, Award, Clock, DollarSign, Briefcase, Star, ArrowRight, CheckCircle, Send } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTasks } from "@/services/taskService";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getProviderOffers } from "@/services/task/offers/queries/getProviderOffers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // Get tasks by status for the Posted Tasks section
  const openTasks = tasks?.filter(task => task.status === 'open') || [];
  const inProgressTasks = tasks?.filter(task => task.status === 'assigned') || [];

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
          <Skeleton className="h-10 w-40 mb-4" />
          <Skeleton className="h-40 rounded-lg mb-6" />
          <Skeleton className="h-10 w-40 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {[1, 2].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="bg-white shadow hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center">
              <Briefcase className="h-6 w-6 text-teal mb-2" />
              <p className="text-sm text-gray-600 mb-1">Active Jobs</p>
              <p className="text-xl font-bold text-teal-dark">{activeTasks.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center">
              <Clock className="h-6 w-6 text-teal mb-2" />
              <p className="text-sm text-gray-600 mb-1">Offers Pending</p>
              <p className="text-xl font-bold text-teal-dark">{pendingOffers.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center">
              <Award className="h-6 w-6 text-teal mb-2" />
              <p className="text-sm text-gray-600 mb-1">Completed Jobs</p>
              <p className="text-xl font-bold text-teal-dark">{completedTasks.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center">
              <DollarSign className="h-6 w-6 text-teal mb-2" />
              <p className="text-sm text-gray-600 mb-1">Earnings to Date</p>
              <p className="text-xl font-bold text-teal-dark">${totalEarnings} AUD</p>
            </CardContent>
          </Card>
        </div>
        
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
            {tasks && tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.slice(0, 3).map(task => (
                  <TaskCard key={task.id} task={task} navigate={navigate} />
                ))}
                {tasks.length > 3 && (
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      className="text-teal" 
                      onClick={() => navigate('/my-jobs')}
                    >
                      View All ({tasks.length}) Tasks
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyTasksCard navigate={navigate} />
            )}
          </TabsContent>
          
          <TabsContent value="open" className="mt-0">
            {openTasks.length > 0 ? (
              <div className="space-y-3">
                {openTasks.slice(0, 3).map(task => (
                  <TaskCard key={task.id} task={task} navigate={navigate} />
                ))}
                {openTasks.length > 3 && (
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      className="text-teal" 
                      onClick={() => navigate('/my-jobs')}
                    >
                      View All ({openTasks.length}) Open Tasks
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyStateCard message="No open tasks yet." />
            )}
          </TabsContent>
          
          <TabsContent value="in-progress" className="mt-0">
            {inProgressTasks.length > 0 ? (
              <div className="space-y-3">
                {inProgressTasks.slice(0, 3).map(task => (
                  <TaskCard key={task.id} task={task} navigate={navigate} />
                ))}
                {inProgressTasks.length > 3 && (
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      className="text-teal" 
                      onClick={() => navigate('/my-jobs')}
                    >
                      View All ({inProgressTasks.length}) In Progress Tasks
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyStateCard message="No tasks in progress." />
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            {completedTasks.length > 0 ? (
              <div className="space-y-3">
                {completedTasks.slice(0, 3).map(task => (
                  <TaskCard key={task.id} task={task} navigate={navigate} />
                ))}
                {completedTasks.length > 3 && (
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      className="text-teal" 
                      onClick={() => navigate('/my-jobs')}
                    >
                      View All ({completedTasks.length}) Completed Tasks
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <EmptyStateCard message="No completed tasks yet." />
            )}
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
            {acceptedOffers.length > 0 ? (
              <div className="space-y-3">
                {acceptedOffers.slice(0, 3).map(offer => (
                  <Card key={offer.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate(`/tasks/${offer.task_id}`)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-teal-dark">
                            {offer.task?.title || "Untitled Task"}
                          </h3>
                          <p className="text-sm text-gray-600">Amount: ${offer.amount}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          In Progress
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        Due: {format(new Date(offer.expected_delivery_date), 'dd MMM yyyy')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {acceptedOffers.length > 3 && (
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      className="text-teal" 
                      onClick={() => navigate('/my-jobs')}
                    >
                      View All ({acceptedOffers.length}) Jobs
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Card className="bg-white p-6 text-center">
                <CardContent className="p-0">
                  <p className="text-gray-600 mb-4">No active jobs right now.</p>
                  <Button 
                    onClick={() => navigate("/find-work")} 
                    className="bg-teal hover:bg-teal-dark text-white"
                  >
                    Find New Tasks
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="offers-made" className="mt-0">
            {pendingOffers.length > 0 ? (
              <div className="space-y-3">
                {pendingOffers.slice(0, 3).map(offer => (
                  <Card key={offer.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate(`/tasks/${offer.task_id}`)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-teal-dark">
                            {offer.task?.title || "Untitled Task"}
                          </h3>
                          <p className="text-sm text-gray-600">Your Offer: ${offer.amount}</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          Pending
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-3 flex items-center">
                        <Send className="h-4 w-4 mr-1" />
                        <span>Offer sent: {format(new Date(offer.created_at), 'dd MMM yyyy')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {pendingOffers.length > 3 && (
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      className="text-teal" 
                      onClick={() => navigate('/my-jobs')}
                    >
                      View All ({pendingOffers.length}) Offers
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Card className="bg-white p-6 text-center">
                <CardContent className="p-0">
                  <p className="text-gray-600 mb-4">You haven't made any offers yet.</p>
                  <Button 
                    onClick={() => navigate("/find-work")} 
                    className="bg-teal hover:bg-teal-dark text-white"
                  >
                    Find Tasks to Bid On
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Recent Reviews Section */}
        <h2 className="text-xl font-semibold text-teal-dark mb-3">Recent Reviews</h2>
        {recentReviews.length > 0 ? (
          <div className="mb-6 grid gap-3 grid-cols-1 md:grid-cols-2">
            {recentReviews.map(review => (
              <Card key={review.id} className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium">{review.customerName}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{review.taskTitle}</p>
                  <p className="text-sm">{review.comment}</p>
                </CardContent>
              </Card>
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

// Component to display task card
const TaskCard = ({ task, navigate }) => {
  // Determine the right status badge
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'assigned':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'pending_complete':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'completed':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Get display text for status
  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'assigned':
      case 'in_progress':
        return 'In Progress';
      case 'pending_complete':
        return 'Pending Approval';
      case 'completed':
        return 'Completed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Card 
      key={task.id} 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/tasks/${task.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-teal-dark">{task.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Due: {format(new Date(task.due_date), 'dd MMM yyyy')}
            </p>
          </div>
          <Badge className={getBadgeStyle(task.status)}>
            {getStatusText(task.status)}
          </Badge>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm">
          <Clock size={14} className="mr-1" />
          <span>{task.offer_count || 0} offers</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Component for empty tasks state
const EmptyTasksCard = ({ navigate }) => {
  return (
    <Card className="bg-white p-6 text-center">
      <CardContent className="p-0">
        <p className="text-gray-600 mb-4">You haven't posted any tasks yet. Create one to get started!</p>
        <Button 
          onClick={() => navigate("/post-task")} 
          className="bg-teal hover:bg-teal-dark text-white"
        >
          Post a New Task
        </Button>
      </CardContent>
    </Card>
  );
};

// Component for empty state messages in tabs
const EmptyStateCard = ({ message }) => {
  return (
    <Card className="bg-white p-6 text-center">
      <CardContent className="p-0">
        <p className="text-gray-600">{message}</p>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
