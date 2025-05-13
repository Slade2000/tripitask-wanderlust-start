
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTaskById } from "@/services/task/queries/getTaskById";
import { submitOffer } from "@/services/task/offers/queries/submitOffer";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/profile/ProfileProvider";
import { toast } from "sonner";
import CommissionCalculator from "@/components/commission/CommissionCalculator";

const SubmitOffer = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [netAmount, setNetAmount] = useState(0);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      
      setLoading(true);
      try {
        const taskData = await getTaskById(taskId);
        if (taskData) {
          setTask(taskData);
          // Set initial amount to the task's budget
          setAmount(taskData.budget || "");
        } else {
          toast.error("Task not found");
          navigate("/find-work");
        }
      } catch (error) {
        console.error("Error fetching task:", error);
        toast.error("Error loading task details");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, navigate]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };

  const handleCalculationDone = (data: { netAmount: number }) => {
    setNetAmount(data.netAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !user || !profile) return;
    
    setSubmitting(true);
    try {
      const result = await submitOffer({
        task_id: taskId,
        provider_id: user.id,
        amount: parseFloat(amount),
        expected_delivery_date: deliveryDate,
        message,
        net_amount: netAmount // Store the net amount (after commission)
      });
      
      if (result.success) {
        toast.success("Offer submitted successfully");
        navigate(`/tasks/${taskId}`);
      } else {
        toast.error(result.error || "Failed to submit offer");
      }
    } catch (error) {
      console.error("Error submitting offer:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-4 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-cream p-4 flex items-center justify-center">
        <p className="text-lg">Task not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/tasks/${taskId}`)}
            className="text-teal hover:text-teal-dark mb-4"
          >
            &larr; Back to task
          </button>
          <h1 className="text-3xl font-bold text-teal">Submit Offer</h1>
          <p className="text-gray-600">
            Task: {task.title}
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Offer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <div className="flex items-center">
                  <span className="mr-2">$</span>
                  <Input
                    id="amount"
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    required
                    disabled={submitting}
                    className="bg-white"
                  />
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <CommissionCalculator 
                    amount={parseFloat(amount)} 
                    isProvider={true}
                    onCalculated={handleCalculationDone}
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Expected Delivery Date</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                  disabled={submitting}
                  className="bg-white"
                  min={new Date().toISOString().split('T')[0]} // Set min date to today
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message to Task Owner (Optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why you're a good fit for this task"
                  rows={5}
                  disabled={submitting}
                  className="bg-white"
                />
              </div>
              
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="w-full bg-teal hover:bg-teal-dark"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Offer"}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate(`/tasks/${taskId}`)}
                  className="w-full"
                  variant="outline"
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubmitOffer;
