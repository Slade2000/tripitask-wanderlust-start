
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Calendar, DollarSign, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { getTaskById } from "@/services/task/queries/getTaskById";
import { submitOffer } from "@/services/task/offers/queries/submitOffer";
import { useAuth } from "@/contexts/AuthContext";

const SubmitOffer = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [price, setPrice] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to submit an offer",
        variant: "destructive",
      });
      return;
    }
    
    if (!price || parseInt(price) <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price for your offer",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryDate) {
      toast({
        title: "Delivery date required",
        description: "Please select an expected delivery date",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const offerData = {
        task_id: taskId || '',
        amount: parseInt(price),
        expected_delivery_date: deliveryDate.toISOString(),
        message: message || undefined
      };
      
      const result = await submitOffer(offerData);
      
      if (result.success) {
        toast({
          title: "Offer Submitted",
          description: "Your offer has been sent to the task owner",
        });
        navigate("/find-work");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit offer",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <h2 className="text-lg font-semibold">{task?.title}</h2>
            <div className="flex items-center mt-2">
              <DollarSign className="h-5 w-5 text-gray-500 mr-1" />
              <span className="text-gray-500">Budget: ${task?.budget}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Offer Form */}
        <form onSubmit={handleSubmit} className="m-4 space-y-4">
          <div>
            <label htmlFor="price" className="block mb-2 font-medium">
              Offer Amount (AUD)
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
            <label className="block mb-2 font-medium">
              Expected Delivery Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  {deliveryDate ? (
                    format(deliveryDate, "PPP")
                  ) : (
                    <span className="text-gray-500">Select a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={deliveryDate}
                  onSelect={setDeliveryDate}
                  initialFocus
                  fromDate={new Date()}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label htmlFor="message" className="block mb-2 font-medium">
              Note to Task Poster (Optional)
            </label>
            <Textarea
              id="message"
              placeholder="Add a note for the task poster..."
              className="h-32"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          
          <Alert className="bg-blue-50 text-blue-800 border border-blue-200">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              By submitting an offer, you agree that your quote includes all service costs. 
              You will be notified if your offer is accepted.
            </AlertDescription>
          </Alert>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2"
              disabled={isSubmitting || !user}
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
