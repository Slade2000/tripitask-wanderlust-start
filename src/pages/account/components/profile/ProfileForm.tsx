
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/contexts/auth/types";

interface ProfileFormProps {
  user: any;
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
  refreshProfile: () => Promise<void>;
  setIsEditMode: (isEdit: boolean) => void;
}

const ProfileForm = ({ 
  user, 
  formData, 
  loading, 
  setFormData, 
  refreshProfile, 
  setIsEditMode 
}: ProfileFormProps) => {
  const { toast } = useToast();
  
  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };
  
  // Handle file upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase
        .storage
        .from('profiles')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      // Update form data
      setFormData((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      
      toast({
        title: "Image uploaded",
        description: "Your profile picture has been updated."
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Save profile updates to database
  const handleSave = async () => {
    if (!user) return;
    
    try {
      // Parse services from comma-separated string to array
      const servicesArray = formData.services.split(',')
        .map(service => service.trim())
        .filter(service => service !== '');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          business_name: formData.business_name,
          about: formData.about,
          location: formData.location,
          services: servicesArray,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refreshProfile();
      setIsEditMode(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-4 border-white shadow">
              <AvatarImage src={formData.avatar_url} />
              <AvatarFallback className="text-2xl bg-gray-200">
                {formData.full_name.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer">
              <Upload size={16} />
              <input 
                id="profile-upload" 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
              />
            </label>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input 
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="business_name">Business Name</Label>
              <Input 
                id="business_name"
                name="business_name"
                value={formData.business_name}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. Sydney, NSW"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="about">About Me</Label>
              <Textarea 
                id="about"
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                placeholder="Tell clients about your experience and skills"
                rows={5}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="services">Services (comma separated)</Label>
              <Input 
                id="services"
                name="services"
                value={formData.services}
                onChange={handleInputChange}
                placeholder="e.g. Electrical, Plumbing, Maintenance"
                disabled={loading}
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => setIsEditMode(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
