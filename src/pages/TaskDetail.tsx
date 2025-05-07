
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getTaskById } from "@/services/taskService";
import { useAuth } from "../contexts/AuthContext"; // Updated import path
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, User, Clock } from "lucide-react";
import { calculateDistance } from "@/services/location/distance";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

// Add the actual component implementation
const TaskDetail: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTaskById(taskId as string),
    enabled: !!taskId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-teal mb-6">Loading task details...</h1>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-cream p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-teal mb-6">Error</h1>
          <p>Could not load task details. Please try again later.</p>
          <Button asChild className="mt-4">
            <Link to="/find-work">Go Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-teal">{task.title}</h1>
          <Button asChild variant="outline">
            <Link to="/find-work">Back</Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-teal/10">
                  {task.category}
                </Badge>
                <Badge variant="outline" className="bg-amber-500/10">
                  ${task.budget}
                </Badge>
              </div>

              <p className="text-gray-700">{task.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-teal" />
                  <span>{task.location?.address || 'Location not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-teal" />
                  <span>{task.date ? format(new Date(task.date), 'PPP') : 'Date not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-teal" />
                  <span>${task.budget}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-teal" />
                  <span>{task.posted_by?.full_name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-teal" />
                  <span>{task.created_at ? format(new Date(task.created_at), 'PPP') : 'Unknown'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mb-6">
          <Button asChild className="w-full max-w-md">
            <Link to={`/tasks/${task.id}/submit-offer`}>Submit Offer</Link>
          </Button>
        </div>

        <Tabs defaultValue="details" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <p>{task.description}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="requirements" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <p>{task.requirements || 'No specific requirements provided.'}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav currentPath={`/tasks/${taskId}`} />
    </div>
  );
};

// Add default export
export default TaskDetail;
