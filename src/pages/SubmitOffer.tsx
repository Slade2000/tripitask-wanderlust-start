
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getTaskById } from "@/services/taskService";

const SubmitOffer = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch task details
  const { data: task, isLoading, error } = useQuery({
    queryKey: ["taskDetail", taskId],
    queryFn: () => getTaskById(taskId || ""),
    enabled: !!taskId,
  });

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Handle offer submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!price || parseInt(price) <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price for your offer",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real implementation, this would call an API
    setTimeout(() => {
      toast({
        title: "Offer Submitted",
        description: "Your offer has been sent to the task owner",
      });
      
      setIsSubmitting(false);
      navigate("/find-work");
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading task...</p>
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
            Back
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

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-4 border-b flex items-center">
          <button onClick={handleBack} className="text-teal">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-center flex-1">Submit Offer</h1>
          <div className="w-5"></div> {/* Empty div for alignment */}
        </div>
        
        {/* Task Summary */}
        <Card className="m-4">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold">{task.title}</h2>
            <div className="flex items-center mt-2">
              <DollarSign className="h-5 w-5 text-gray-500 mr-1" />
              <span className="text-gray-500">Budget: ${task.budget}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Offer Form */}
        <form onSubmit={handleSubmit} className="m-4 space-y-4">
          <div>
            <label htmlFor="price" className="block mb-2 font-medium">
              Your Offer Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
              <Input
                id="price"
                type="number"
                placeholder="Enter your price"
                className="pl-10"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="1"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="message" className="block mb-2 font-medium">
              Message to Task Owner (Optional)
            </label>
            <Textarea
              id="message"
              placeholder="Introduce yourself and explain why you're the best person for this task..."
              className="h-32"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              Submit Offer
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              {isSubmitting && (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitOffer;
