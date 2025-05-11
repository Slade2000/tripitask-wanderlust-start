
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { getTaskById } from "@/services/task/queries/getTaskById";
import { getTaskOffers } from "@/services/task/offers/queries/getTaskOffers";
import { Offer } from "@/types/offer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import OffersList from "@/components/offers/OffersList";

export default function TaskOffersPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [task, setTask] = useState<any>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTaskAndOffers = async () => {
    setLoading(true);
    setError(null);
    
    if (!taskId) {
      setError("Task ID is missing");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Loading task with ID:", taskId);
      
      // Fetch task details
      const taskData = await getTaskById(taskId);
      console.log("Task data received:", taskData);
      
      if (taskData) {
        setTask(taskData);
        
        try {
          // Fetch offers for the task
          console.log("Fetching offers for task:", taskId);
          const offersData = await getTaskOffers(taskId);
          console.log("Offers data received:", offersData);
          
          setOffers(offersData);
          
          if (offersData.length === 0) {
            console.log("No offers found for this task");
          }
        } catch (offerError) {
          console.error("Error fetching offers:", offerError);
          setError(`Failed to load offers: ${offerError instanceof Error ? offerError.message : 'Unknown error'}`);
        }
      } else {
        setError("Task not found");
        toast({
          title: "Error",
          description: "Task not found",
          variant: "destructive",
        });
        navigate("/my-jobs");
      }
    } catch (error) {
      console.error("Error loading task or offers:", error);
      setError("Failed to load task offers");
      toast({
        title: "Error",
        description: "Failed to load task offers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaskAndOffers();
  }, [taskId, navigate, toast]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={handleBack} 
          className="flex items-center text-teal hover:text-teal-dark"
        >
          <ChevronLeft size={24} />
          <span className="ml-1">Back</span>
        </button>
        <Logo />
      </div>
      
      <h1 className="text-2xl font-bold text-teal text-center my-6">
        {loading ? "Loading..." : task ? `Offers for ${task.title}` : "Task Not Found"}
      </h1>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4 text-center">
          {error}
        </div>
      )}
      
      <div className="max-w-4xl mx-auto">
        <OffersList 
          offers={offers} 
          taskId={taskId || ''} 
          loading={loading} 
          onRefresh={loadTaskAndOffers}
        />
      </div>
    </div>
  );
}
