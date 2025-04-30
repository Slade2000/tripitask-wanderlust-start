
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { format } from "date-fns";
import { TaskData } from "@/services/taskService";

interface ReviewSubmitStepProps {
  taskData: TaskData;
  onSubmit: () => void;
  onBack: () => void;
  submitting?: boolean;
}

const ReviewSubmitStep = ({ 
  taskData, 
  onSubmit, 
  onBack, 
  submitting = false 
}: ReviewSubmitStepProps) => {
  // Format dueDate from ISO string to Date for display if it exists
  const dueDate = taskData.due_date ? new Date(taskData.due_date) : undefined;
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-teal-dark text-center">
        Review and Submit
      </h2>
      
      <p className="text-center text-teal-dark">
        Post your task when you are ready
      </p>

      <Card className="border-teal-light">
        <CardContent className="pt-4 px-4">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-teal-dark">Task Title</h3>
                <p>{taskData.title}</p>
              </div>
              <Button 
                variant="ghost" 
                className="h-8 px-2 text-teal"
                onClick={() => onBack()}
                disabled={submitting}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {taskData.description && (
        <Card className="border-teal-light">
          <CardContent className="pt-4 px-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-teal-dark">Description</h3>
                <p className="text-sm">{taskData.description}</p>
              </div>
              <Button 
                variant="ghost" 
                className="h-8 px-2 text-teal"
                onClick={() => onBack()}
                disabled={submitting}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {taskData.photos && taskData.photos.length > 0 && (
        <Card className="border-teal-light">
          <CardContent className="pt-4 px-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-teal-dark">Photos</h3>
                <Button 
                  variant="ghost" 
                  className="h-8 px-2 text-teal"
                  onClick={() => onBack()}
                  disabled={submitting}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {taskData.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 border rounded-md overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`uploaded ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {taskData.budget && (
        <Card className="border-teal-light">
          <CardContent className="pt-4 px-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-teal-dark">Budget</h3>
                <p>AUD ${taskData.budget}</p>
              </div>
              <Button 
                variant="ghost" 
                className="h-8 px-2 text-teal"
                onClick={() => onBack()}
                disabled={submitting}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {taskData.location && (
        <Card className="border-teal-light">
          <CardContent className="pt-4 px-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-teal-dark">Location</h3>
                <p>{taskData.location}</p>
              </div>
              <Button 
                variant="ghost" 
                className="h-8 px-2 text-teal"
                onClick={() => onBack()}
                disabled={submitting}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {dueDate && (
        <Card className="border-teal-light">
          <CardContent className="pt-4 px-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-teal-dark">Preferred Due Date</h3>
                <p>{format(dueDate, "PPP")}</p>
              </div>
              <Button 
                variant="ghost" 
                className="h-8 px-2 text-teal"
                onClick={() => onBack()}
                disabled={submitting}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="pt-6">
        <Button
          onClick={onSubmit}
          className="w-full bg-teal hover:bg-teal-dark text-cream py-6 text-lg"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Task'}
        </Button>
      </div>
    </div>
  );
};

export default ReviewSubmitStep;
