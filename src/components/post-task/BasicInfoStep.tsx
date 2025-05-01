import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Image, Upload, Plus } from "lucide-react";
export interface BasicInfoFormData {
  title: string;
  photos: File[];
  budget: string;
}
export interface BasicInfoProps {
  initialData: {
    title: string;
    photos: File[];
    budget: string;
  };
  onSubmit: (data: BasicInfoFormData) => void;
  onBack?: () => void; // Added optional back handler
}
const BasicInfoStep = ({
  onSubmit,
  initialData,
  onBack
}: BasicInfoProps) => {
  const [title, setTitle] = useState(initialData.title);
  const [photos, setPhotos] = useState<File[]>(initialData.photos);
  const [budget, setBudget] = useState(initialData.budget);
  const [titleError, setTitleError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      // Limit to 5 photos max
      const newPhotos = [...photos, ...fileArray].slice(0, 5);
      setPhotos(newPhotos);
    }
  };
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };
  const handleSubmit = () => {
    if (!title.trim()) {
      setTitleError("Please enter a task title");
      return;
    }
    onSubmit({
      title,
      photos,
      budget
    });
  };
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };
  return <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-teal-dark">
          What do you need help with?
        </h2>
        <div>
          <Input placeholder="Give your task a title" value={title} onChange={e => {
          setTitle(e.target.value);
          setTitleError("");
        }} className={`text-base bg-white ${titleError ? "border-red" : ""}`} />
          {titleError && <p className="text-sm text-red-500 mt-1">{titleError}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-teal-dark">Upload Photos (Optional)</Label>
        <div className="flex flex-wrap gap-2 justify-center">
          {/* Display photo previews */}
          {photos.map((photo, index) => <div key={index} className="relative w-20 h-20 border rounded-md overflow-hidden">
              <img src={URL.createObjectURL(photo)} alt={`uploaded preview ${index + 1}`} className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(index)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                ×
              </button>
            </div>)}
          
          {/* Add photo buttons directly in the UI instead of in a dialog */}
          {photos.length < 5 && <div className="flex gap-2">
              <Button onClick={handleCameraClick} variant="outline" className="h-20 w-20 flex flex-col items-center justify-center">
                <Camera className="h-5 w-5 mb-1" />
                <span className="text-xs">Take Photo</span>
              </Button>
              <Button onClick={handleUploadClick} variant="outline" className="h-20 w-20 flex flex-col items-center justify-center">
                <Image className="h-5 w-5 mb-1" />
                <span className="text-xs">Add Photo</span>
              </Button>
            </div>}
        </div>
        <p className="text-xs text-teal-dark/70">
          You can upload up to 5 photos
        </p>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" multiple />
        <input ref={cameraInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" capture="environment" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="budget" className="text-teal-dark">
            Set your Budget (AUD)
          </Label>
          <Input id="budget" type="number" placeholder="Enter amount" value={budget} onChange={e => setBudget(e.target.value)} className="text-base bg-white max-w-40" />
        </div>
      </div>

      <div className="pt-6">
        <Button onClick={handleSubmit} className="w-full bg-gold hover:bg-orange text-teal-dark py-6 text-lg">Next</Button>
      </div>
    </div>;
};
export default BasicInfoStep;