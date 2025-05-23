
import { useToast } from "@/hooks/use-toast";
import { updateOfferStatus } from "@/services/task/offers/queries/updateOfferStatus";
import { getTaskById } from "@/services/task/queries/getTaskById";

interface OfferActionsProps {
  taskId: string;
  offerId: string;
  onUpdate: () => Promise<void>;
  setUpdatingOfferId: (id: string | null) => void;
}

export default function OfferActions({
  taskId,
  offerId,
  onUpdate,
  setUpdatingOfferId
}: OfferActionsProps) {
  const { toast } = useToast();
  
  const handleAcceptOffer = async () => {
    if (!taskId) return;
    
    console.log("Accepting offer:", offerId);
    setUpdatingOfferId(offerId);
    
    try {
      const result = await updateOfferStatus(offerId, 'accepted');
      if (result.success) {
        toast({
          title: "Success",
          description: "Offer accepted successfully",
        });
        
        // Get the latest task data to ensure we have the updated status
        const updatedTask = await getTaskById(taskId);
        console.log("Task status after accepting offer:", updatedTask?.status);
        
        // Refresh offers list and parent components
        await onUpdate();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to accept offer",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingOfferId(null);
    }
  };

  const handleRejectOffer = async () => {
    if (!taskId) return;
    
    console.log("Rejecting offer:", offerId);
    setUpdatingOfferId(offerId);
    
    try {
      const result = await updateOfferStatus(offerId, 'rejected');
      if (result.success) {
        toast({
          title: "Success",
          description: "Offer rejected successfully",
        });
        
        // Refresh offers list
        await onUpdate();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reject offer",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rejecting offer:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingOfferId(null);
    }
  };
  
  return {
    handleAcceptOffer,
    handleRejectOffer
  };
}
