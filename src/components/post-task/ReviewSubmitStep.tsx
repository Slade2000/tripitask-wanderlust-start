
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, FileText, Clock, MapPin, DollarSign, Camera } from "lucide-react";
import { format } from "date-fns";
import { TaskData } from "@/services/task/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ReviewSubmitStepProps {
  taskData: TaskData;
  onSubmit: () => void;
  onBack: () => void;
  onEditField: (field: string) => void;
  submitting?: boolean;
}

const ReviewSubmitStep = ({
  taskData,
  onSubmit,
  onBack,
  onEditField,
  submitting = false
}: ReviewSubmitStepProps) => {
  // Format dueDate from ISO string to Date for display if it exists
  const dueDate = taskData.due_date ? new Date(taskData.due_date) : undefined;
  
  // Function to generate preview URL for both File and string types
  const getPhotoUrl = (photo: File | string): string => {
    if (typeof photo === 'string') {
      return photo; // It's already a URL string
    } else {
      return URL.createObjectURL(photo); // It's a File object
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-teal-dark text-center">
        Review and Submit
      </h2>
      
      <p className="text-center text-teal-dark">
        Post your task when you are ready
      </p>

      <Card className="border-teal-light">
        <CardContent className="pt-6 px-4">
          <div className="space-y-4">
            {/* Task Title */}
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-teal-dark shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-center w-full">
                  <p className="font-semibold">{taskData.title}</p>
                  <Button variant="ghost" className="h-8 px-2 text-teal" onClick={() => onEditField("title")} disabled={submitting}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Description */}
                {taskData.description && <p className="text-sm text-gray-600 mt-1">{taskData.description}</p>}
              </div>
            </div>
            
            <div className="border-t border-gray-100 my-4"></div>

            {/* Location */}
            {taskData.location && <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-teal-dark shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-center w-full">
                    <p>{taskData.location}</p>
                    <Button variant="ghost" className="h-8 px-2 text-teal" onClick={() => onEditField("location")} disabled={submitting}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>}

            {/* Due Date */}
            {dueDate && <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-teal-dark shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-center w-full">
                    <p>{format(dueDate, "PPP")}</p>
                    <Button variant="ghost" className="h-8 px-2 text-teal" onClick={() => onEditField("due_date")} disabled={submitting}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>}

            {/* Budget */}
            {taskData.budget && <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-teal-dark shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-center w-full">
                    <p>AUD ${taskData.budget}</p>
                    <Button variant="ghost" className="h-8 px-2 text-teal" onClick={() => onEditField("budget")} disabled={submitting}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>}

            {/* Photos */}
            {taskData.photos && taskData.photos.length > 0 && <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-teal-dark shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-center w-full mb-2">
                    <p>Task Photos</p>
                    <Button variant="ghost" className="h-8 px-2 text-teal" onClick={() => onEditField("photos")} disabled={submitting}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {taskData.photos.map((photo, index) => (
                      <div key={index} className="w-16 h-16 border rounded-md overflow-hidden">
                        <img 
                          src={getPhotoUrl(photo)} 
                          alt={`uploaded ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>}
          </div>
        </CardContent>
      </Card>

      <div className="pt-6">
        <Button 
          onClick={onSubmit} 
          disabled={submitting} 
          className="w-full bg-gold hover:bg-orange text-teal-dark py-6 text-lg"
        >
          {submitting ? 'Submitting...' : 'Submit Task'}
        </Button>
      </div>
    </div>
  );
};

export default ReviewSubmitStep;
