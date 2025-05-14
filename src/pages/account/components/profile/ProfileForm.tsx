
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Profile, Certificate } from "@/contexts/auth/types";

// Import the new components
import AvatarUpload from "./AvatarUpload";
import CertificationsManager from "./CertificationsManager";
import BasicProfileInfo from "./BasicProfileInfo";

interface ProfileFormProps {
  user: User | null;
  formData: {
    full_name: string;
    business_name: string;
    about: string;
    location: string;
    services: string;
    avatar_url: string;
    trade_registry_number: string;
    certifications: Certificate[];
  };
  loading: boolean;
  setFormData: (data: any) => void;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  setIsEditMode: (edit: boolean) => void;
  uploadAvatar: (file: File) => Promise<string | null>;
  uploadCertificate: (file: File, certName: string) => Promise<string | null>;
  addCertificate: (name: string, file?: File) => Promise<void>;
  removeCertificate: (index: number) => void;
  uploadingAvatar: boolean;
  uploadingCertificate: boolean;
}

const ProfileForm = ({ 
  user, 
  formData, 
  loading, 
  setFormData, 
  updateProfile, 
  setIsEditMode,
  uploadAvatar,
  uploadCertificate,
  addCertificate,
  removeCertificate,
  uploadingAvatar,
  uploadingCertificate
}: ProfileFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handleAvatarChange = (file: File) => {
    setAvatarFile(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Parse services from comma-separated string to array
      const servicesArray = formData.services
        .split(',')
        .map(service => service.trim())
        .filter(service => service.length > 0);

      // If we have a new avatar file, upload it first
      let avatarUrl = formData.avatar_url;
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }
      
      await updateProfile({
        full_name: formData.full_name,
        business_name: formData.business_name,
        about: formData.about,
        location: formData.location,
        services: servicesArray,
        avatar_url: avatarUrl,
        trade_registry_number: formData.trade_registry_number,
        certifications: formData.certifications
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AvatarUpload
            avatarUrl={formData.avatar_url}
            onAvatarChange={handleAvatarChange}
            isUploading={uploadingAvatar}
            disabled={isSaving}
          />
          
          <BasicProfileInfo
            fullName={formData.full_name}
            businessName={formData.business_name}
            tradeRegistryNumber={formData.trade_registry_number}
            location={formData.location}
            about={formData.about}
            services={formData.services}
            onChange={handleChange}
            disabled={isSaving}
          />
          
          <CertificationsManager
            certifications={formData.certifications}
            onAddCertificate={addCertificate}
            onRemoveCertificate={removeCertificate}
            disabled={isSaving}
            isUploading={uploadingCertificate}
          />
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditMode(false)}
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || uploadingAvatar || uploadingCertificate}
              className="flex-1"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
