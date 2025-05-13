
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Profile } from "@/contexts/auth/types";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import LocationSearchInput from "@/components/location/LocationSearchInput";
import { useLocationSearch } from "@/hooks/useLocationSearch";

interface ProfileFormProps {
  user: User | null;
  formData: {
    full_name: string;
    business_name: string;
    about: string;
    location: string;
    services: string;
    avatar_url: string;
  };
  loading: boolean;
  setFormData: (data: any) => void;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  setIsEditMode: (edit: boolean) => void;
}

const ProfileForm = ({ 
  user, 
  formData, 
  loading, 
  setFormData, 
  updateProfile, 
  setIsEditMode 
}: ProfileFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Parse services from comma-separated string to array
      const servicesArray = formData.services
        .split(',')
        .map(service => service.trim())
        .filter(service => service.length > 0);
      
      await updateProfile({
        full_name: formData.full_name,
        business_name: formData.business_name,
        about: formData.about,
        location: formData.location,
        services: servicesArray,
        avatar_url: formData.avatar_url
      });
      
      toast.success("Profile updated successfully");
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={isSaving}
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
