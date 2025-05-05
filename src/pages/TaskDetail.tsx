
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, DollarSign, MapPin, Calendar, Send, FileText, Image } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { getTaskById } from "@/services/taskService";
import { calculateDistance } from "@/services/locationService";

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  
  // Get user's current location for distance calculation
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  // Fetch user location
  useState(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  });

  // Fetch task details
  const { data: task, isLoading, error } = useQuery({
    queryKey: ["taskDetail", taskId],
    queryFn: () => getTaskById(taskId || ""),
    enabled: !!taskId,
  });

  // Calculate distance from user to task
  const distanceToTask = () => {
    if (!userLocation || !task?.latitude || !task?.longitude) return null;
    
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      task.latitude,
      task.longitude
    );
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Open task location in maps
  const openInMaps = () => {
    if (task?.latitude && task?.longitude) {
      window.open(`https://maps.google.com/?q=${task.latitude},${task.longitude}`, '_blank');
    } else {
      window.open(`https://maps.google.com/maps?q=${encodeURIComponent(task?.location || "")}`, '_blank');
    }
  };

  // Handle send message
  const handleSendMessage = () => {
    // This would navigate to the messaging screen
    toast({
      title: "Coming Soon",
      description: "Messaging functionality will be available soon",
    });
  };

  // Handle submit offer
  const handleSubmitOffer = () => {
    navigate(`/tasks/${taskId}/submit-offer`);
  };

  // Handle photo click
  const handlePhotoClick = (url: string) => {
    setExpandedPhoto(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-cream p-4">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
          <button onClick={handleBack} className="flex items-center text-teal mb-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to tasks
          </button>
          <div className="text-center py-8">
            <p className="text-red-500 font-medium mb-2">Error loading task details</p>
            <p className="text-sm text-gray-500 mb-4">
              {error instanceof Error ? error.message : "Task not found or has been removed"}
            </p>
            <Button onClick={handleBack}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const distance = distanceToTask();
  
  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-4 border-b flex items-center">
          <button onClick={handleBack} className="text-teal">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-center flex-1">Task Details</h1>
          <div className="w-5"></div> {/* Empty div for alignment */}
        </div>
        
        {/* Task Summary Card */}
        <Card className="m-4">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">{task.title}</h2>
            
            {/* Task status */}
            <div className="mb-4">
              <Badge variant={task.status === 'urgent' ? "destructive" : "default"} className="capitalize">
                {task.status || 'Open'}
              </Badge>
              
              {task.categories && (
                <Badge variant="secondary" className="ml-2">
                  {task.categories.name}
                </Badge>
              )}
            </div>
            
            <div className="space-y-3 mt-4">
              {/* Budget */}
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-teal mr-2" />
                <span className="font-medium">${task.budget}</span>
              </div>
              
              {/* Location */}
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-teal mr-2" />
                <button 
                  onClick={openInMaps}
                  className="text-left text-primary underline underline-offset-2"
                >
                  {task.location}
                </button>
              </div>
              
              {/* Due Date */}
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-teal mr-2" />
                <span>Due: {format(new Date(task.due_date), "MMMM d, yyyy")}</span>
              </div>
              
              {/* Distance */}
              {distance !== null && (
                <div className="text-sm text-gray-500">
                  {distance < 1 
                    ? `${(distance * 1000).toFixed(0)} meters from your location` 
                    : `${distance.toFixed(1)} km from your location`
                  }
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Task Description Section */}
        <div className="m-4">
          <div className="flex items-center mb-2">
            <FileText className="h-5 w-5 text-teal mr-2" />
            <h3 className="text-lg font-medium">Task Description</h3>
          </div>
          <ScrollArea className="h-[200px] rounded-md border p-4">
            <p className="whitespace-pre-wrap">{task.description}</p>
          </ScrollArea>
        </div>
        
        {/* Photos Section */}
        {task.task_photos && task.task_photos.length > 0 && (
          <div className="m-4">
            <div className="flex items-center mb-2">
              <Image className="h-5 w-5 text-teal mr-2" />
              <h3 className="text-lg font-medium">Photos</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {task.task_photos.map((photo: any) => (
                <div 
                  key={photo.id}
                  className="aspect-square rounded-md overflow-hidden cursor-pointer"
                  onClick={() => handlePhotoClick(photo.url)}
                >
                  <img 
                    src={photo.url}
                    alt="Task photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Questions Section */}
        <div className="m-4 pt-2 border-t">
          <h3 className="font-medium mb-2">Have questions?</h3>
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={handleSendMessage}
          >
            <Send className="h-4 w-4" />
            Send Message
          </Button>
        </div>
        
        {/* Bottom CTA */}
        <div className="sticky bottom-0 p-4 border-t bg-white">
          <Button 
            className="w-full"
            onClick={handleSubmitOffer}
          >
            Submit Offer
          </Button>
        </div>
      </div>
      
      {/* Photo Modal */}
      {expandedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setExpandedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img 
              src={expandedPhoto} 
              alt="Expanded task photo" 
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button 
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedPhoto(null);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
