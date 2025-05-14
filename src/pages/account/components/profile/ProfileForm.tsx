import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Profile, Certificate } from "@/contexts/auth/types";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import LocationSearchInput from "@/components/location/LocationSearchInput";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { PlusCircle, X, Upload } from "lucide-react";

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
  const [newCertName, setNewCertName] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(formData.avatar_url || null);
  
  // Use the location search hook for Google Places integration
  const { 
    searchTerm, 
    setSearchTerm, 
    suggestions, 
    isLoading: locationLoading,
    resetSearch
  } = useLocationSearch({
    initialTerm: formData.location,
    debounceTime: 300
  });
  
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleLocationSelect = (location: string) => {
    setFormData({ ...formData, location });
    resetSearch();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCertFile(e.target.files[0]);
    }
  };

  const handleAddCertificate = async () => {
    if (!newCertName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a certificate name",
        variant: "destructive",
      });
      return;
    }
    
    await addCertificate(newCertName, certFile || undefined);
    
    // Reset form
    setNewCertName('');
    setCertFile(null);
    
    // Reset the file input
    const fileInput = document.getElementById('cert-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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
                    {formData.full_name?.charAt(0) || "U"}
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
                disabled={isSaving || uploadingAvatar} 
              />
            </div>
            {uploadingAvatar && <p className="text-sm text-gray-500">Uploading avatar...</p>}
          </div>
          
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="Your full name"
            />
          </div>
          
          <div>
            <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <Input
              id="business_name"
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="Your business name"
            />
          </div>
          
          <div>
            <label htmlFor="trade_registry_number" className="block text-sm font-medium text-gray-700 mb-1">
              Trade Registry Number
            </label>
            <Input
              id="trade_registry_number"
              name="trade_registry_number"
              value={formData.trade_registry_number}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="Your trade registry number"
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <LocationSearchInput
              searchTerm={searchTerm || formData.location}
              setSearchTerm={(term) => {
                setSearchTerm(term);
                setFormData({ ...formData, location: term });
              }}
              suggestions={suggestions}
              isLoading={locationLoading}
              showSuggestions={showLocationSuggestions}
              setShowSuggestions={setShowLocationSuggestions}
              onLocationSelect={handleLocationSelect}
              label=""
              placeholder="Enter your location"
              disabled={isSaving}
            />
          </div>
          
          <div>
            <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
              About Me
            </label>
            <Textarea
              id="about"
              name="about"
              value={formData.about}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="Tell clients about yourself and your services"
              rows={4}
            />
          </div>
          
          <div>
            <label htmlFor="services" className="block text-sm font-medium text-gray-700 mb-1">
              Services (comma separated)
            </label>
            <Input
              id="services"
              name="services"
              value={formData.services}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="e.g. Plumbing, Electrical, Carpentry"
            />
          </div>
          
          <div className="border rounded-md p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certifications & Qualifications
            </label>
            
            {formData.certifications.length > 0 ? (
              <div className="space-y-2 mb-4">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span>{cert.name}</span>
                      {cert.verified && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                      {cert.file_url && (
                        <a 
                          href={cert.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-blue-600 ml-2"
                        >
                          View file
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertificate(index)}
                      className="text-red-500"
                      disabled={isSaving}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No certifications added yet</p>
            )}
            
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={newCertName}
                  onChange={(e) => setNewCertName(e.target.value)}
                  placeholder="Certificate name"
                  disabled={isSaving || uploadingCertificate}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleAddCertificate}
                  disabled={!newCertName.trim() || isSaving || uploadingCertificate}
                >
                  <PlusCircle size={16} className="mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="flex items-center">
                <Input
                  id="cert-file"
                  type="file"
                  onChange={handleCertFileChange}
                  className="flex-1"
                  disabled={isSaving || uploadingCertificate}
                />
                <span className="text-xs text-gray-500 ml-2">Optional</span>
              </div>
              
              {uploadingCertificate && (
                <p className="text-sm text-gray-500">Uploading certificate...</p>
              )}
            </div>
          </div>
          
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
