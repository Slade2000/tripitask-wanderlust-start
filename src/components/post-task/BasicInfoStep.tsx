import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePostTask } from "@/contexts/PostTaskContext";
import { useCategories } from "@/hooks/useCategories";
import CommissionCalculator from "@/components/commission/CommissionCalculator";

interface BasicInfoStepProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  initialData?: {
    title?: string;
    category_id?: string;
    budget?: number;
    photos?: File[];
  };
}

const BasicInfoStep = ({ onSubmit, onBack, initialData = {} }: BasicInfoStepProps) => {
  const { taskData, setTaskData, setCurrentStep } = usePostTask();
  const { categories, isLoading } = useCategories();
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskData({ ...taskData, title: e.target.value });
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTaskData({ ...taskData, description: e.target.value });
  };
  
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const budgetValue = e.target.value.replace(/[^0-9.]/g, '');
    setTaskData({ ...taskData, budget: budgetValue });
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTaskData({ ...taskData, category_id: e.target.value });
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const newFiles = Array.from(e.target.files);
    
    // Limit to 5 photos total
    const updatedPhotos = [...taskData.photos || [], ...newFiles].slice(0, 5);
    setTaskData({ ...taskData, photos: updatedPhotos });
  };
  
  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = [...taskData.photos || []];
    updatedPhotos.splice(index, 1);
    setTaskData({ ...taskData, photos: updatedPhotos });
  };
  
  const handleNextStep = () => {
    setCurrentStep("location-date");
  };
  
  return (
    <div className="mt-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title</Label>
          <Input
            id="title"
            value={taskData.title}
            onChange={handleTitleChange}
            placeholder="e.g., Help moving furniture"
            className="bg-white"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Task Description</Label>
          <Textarea
            id="description"
            value={taskData.description}
            onChange={handleDescriptionChange}
            placeholder="Describe what you need help with. Be specific about requirements and expectations."
            className="min-h-[120px] bg-white"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="budget">Budget ($)</Label>
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <Input
                id="budget"
                type="text"
                value={taskData.budget}
                onChange={handleBudgetChange}
                placeholder="Enter amount"
                className="bg-white"
                required
              />
            </div>
            {taskData.budget && parseFloat(taskData.budget) > 0 && (
              <CommissionCalculator amount={parseFloat(taskData.budget)} />
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={taskData.category_id}
              onChange={handleCategoryChange}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal bg-white"
              required
            >
              <option value="">Select a category</option>
              {isLoading ? (
                <option value="" disabled>Loading categories...</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="photos">Task Photos (Optional)</Label>
          <p className="text-sm text-gray-500">
            Upload up to 5 photos that help explain your task
          </p>
          
          <div className="mt-2 flex flex-wrap gap-4">
            {taskData.photos && taskData.photos.map((photo, index) => (
              <div key={index} className="relative">
                <div className="h-24 w-24 border rounded-lg overflow-hidden bg-white">
                  <img
                    src={photo instanceof File ? URL.createObjectURL(photo) : photo}
                    alt={`Task photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            
            {(!taskData.photos || taskData.photos.length < 5) && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                disabled={uploadingPhotos}
              >
                {uploadingPhotos ? (
                  <div className="animate-spin h-5 w-5 border-2 border-teal border-t-transparent rounded-full"></div>
                ) : (
                  <span className="text-2xl">+</span>
                )}
              </button>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              id="photos"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploadingPhotos}
            />
          </div>
        </div>
        
        <div className="pt-4">
          <Button
            type="button"
            onClick={handleNextStep}
            className="w-full bg-teal hover:bg-teal-dark"
            disabled={!taskData.title || !taskData.description || !taskData.budget || !taskData.category_id}
          >
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
