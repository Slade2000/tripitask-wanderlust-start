
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Profile } from "@/contexts/auth/types";
import { User } from "@/types/user";

// Form validation schema
const profileSchema = z.object({
  full_name: z.string().min(1, { message: "Name is required" }),
  business_name: z.string().optional(),
  about: z.string().optional(),
  location: z.string().optional(),
  services: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

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
  updateProfile: (profileData: Partial<Profile>) => Promise<Profile | null>;
  setIsEditMode: (isEdit: boolean) => void;
}

const ProfileForm = ({
  user,
  formData,
  loading,
  setFormData,
  updateProfile,
  setIsEditMode,
}: ProfileFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: formData.full_name || "",
      business_name: formData.business_name || "",
      about: formData.about || "",
      location: formData.location || "",
      services: formData.services || "",
    },
  });
  
  const onSubmit = async (data: ProfileFormData) => {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Parse services from comma-separated string to array
      const servicesArray = data.services
        ? data.services.split(",").map(service => service.trim()).filter(Boolean)
        : [];
        
      const result = await updateProfile({
        full_name: data.full_name,
        business_name: data.business_name,
        about: data.about,
        location: data.location,
        services: servicesArray,
      });
        
      if (result) {
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Exception updating profile:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    setIsEditMode(false);
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="business_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your business name (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell customers about yourself and your business..." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Your location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Services</FormLabel>
                  <FormControl>
                    <Input placeholder="Services (comma separated)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
