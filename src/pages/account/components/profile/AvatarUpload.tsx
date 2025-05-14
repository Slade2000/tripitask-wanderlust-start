
import { useState } from "react";
import { Upload } from "lucide-react";

interface AvatarUploadProps {
  avatarUrl: string | null;
  onAvatarChange: (file: File) => void;
  isUploading: boolean;
  disabled: boolean;
}

const AvatarUpload = ({ 
  avatarUrl, 
  onAvatarChange, 
  isUploading, 
  disabled 
}: AvatarUploadProps) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onAvatarChange(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative w-24 h-24 mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
          {avatarPreview ? (
            <img 
              src={avatarPreview} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
              {/* Placeholder */}
              U
            </div>
          )}
        </div>
        <label 
          htmlFor="avatar-upload" 
          className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer"
        >
          <Upload size={16} />
        </label>
        <input 
          id="avatar-upload" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleAvatarChange}
          disabled={disabled || isUploading} 
        />
      </div>
      {isUploading && <p className="text-sm text-gray-500">Uploading avatar...</p>}
    </div>
  );
};

export default AvatarUpload;
