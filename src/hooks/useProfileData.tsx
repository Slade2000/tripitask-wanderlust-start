
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Profile, Certificate } from "@/contexts/auth/types";
import { supabase } from "@/integrations/supabase/client";
import { getUserReviews } from "@/services/task/reviews";
import { toast } from "@/components/ui/use-toast";
import { Review } from "@/services/task/reviews/getTaskReviews";

// Define the structure of the profile data
export interface ProfileDataState {
  rating: number;
  jobsCompleted: number;
  certifications: Certificate[];
  reviews: Array<{
    id?: string;
    task_id?: string;
    reviewer_id?: string;
    reviewee_id?: string;
    rating: number;
    feedback?: string;
    created_at?: string;
    is_provider_review?: boolean;
    reviewer?: string;
    task?: string;
  }>;
}

// Add any other custom types if needed
export const useProfileData = () => {
  const { user, profile: authProfile, refreshProfile: authRefreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<{
    full_name: string;
    business_name: string;
    about: string;
    location: string;
    services: string;
    avatar_url: string;
    trade_registry_number: string;
    certifications: Certificate[];
  }>({
    full_name: "",
    business_name: "",
    about: "",
    location: "",
    services: "",
    avatar_url: "",
    trade_registry_number: "",
    certifications: []
  });
  
  const [profileData, setProfileData] = useState<ProfileDataState>({
    rating: 0,
    jobsCompleted: 0,
    certifications: [],
    reviews: []
  });
  
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);

  // Utility functions
  const getUserName = () => {
    if (authProfile?.full_name) return authProfile.full_name;
    return user?.email || "User";
  };

  const getBusinessName = () => {
    return authProfile?.business_name || "No business name set";
  };

  // Refresh profile data 
  const refreshProfile = async () => {
    if (!user) return null;
    
    try {
      // Refresh the basic profile from auth context
      const updatedProfile = await authRefreshProfile();
      
      // Load additional profile data (reviews, etc.)
      if (updatedProfile) {
        await loadProfileData(updatedProfile.id);
      }
      
      return updatedProfile;
    } catch (error) {
      console.error("Error refreshing profile:", error);
      setError(true);
      setErrorMessage("Failed to refresh profile data");
      return null;
    }
  };

  const handleRetryLoadProfile = async () => {
    setError(false);
    setErrorMessage(null);
    setLoading(true);
    await refreshProfile();
    setLoading(false);
  };

  // Load additional profile data 
  const loadProfileData = async (userId: string) => {
    try {
      // Get user reviews
      const reviews = await getUserReviews(userId);
      
      // Transform reviews to the format expected by the component
      const formattedReviews = reviews.map(review => ({
        id: review.id,
        task_id: review.task_id,
        reviewer_id: review.reviewer_id,
        reviewee_id: review.reviewee_id,
        rating: review.rating,
        feedback: review.feedback,
        created_at: review.created_at,
        is_provider_review: review.is_provider_review,
        reviewer: review.reviewer?.full_name || "Anonymous",
        task: review.task?.title || "Task"
      }));
      
      setProfileData(prev => ({
        ...prev,
        reviews: formattedReviews,
        rating: authProfile?.rating || 0,
        jobsCompleted: authProfile?.jobs_completed || 0
      }));
      
    } catch (error) {
      console.error("Error loading profile data:", error);
      setProfileData(prev => ({
        ...prev,
        reviews: []
      }));
    }
  };

  // Initial load
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(false);
      setErrorMessage(null);

      try {
        if (user && authProfile) {
          setFormData({
            full_name: authProfile.full_name || "",
            business_name: authProfile.business_name || "",
            about: authProfile.about || "",
            location: authProfile.location || "",
            services: authProfile.services?.join(", ") || "",
            avatar_url: authProfile.avatar_url || "",
            trade_registry_number: authProfile.trade_registry_number || "",
            certifications: authProfile.certifications || []
          });
          
          setProfileData(prev => ({
            ...prev,
            rating: authProfile.rating || 0,
            jobsCompleted: authProfile.jobs_completed || 0,
            certifications: authProfile.certifications || []
          }));
          
          await loadProfileData(user.id);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(true);
        setErrorMessage("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, authProfile]);

  // Function to update profile
  const updateProfile = async (data: Partial<Profile>) => {
    if (!user?.id) return null;
    
    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh profile data after update
      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return null;
    }
  };

  // Upload avatar function
  const uploadAvatar = async (file: File) => {
    if (!user) return null;
    
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      await updateProfile({ avatar_url: publicUrl });
      
      return publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Upload certificate function
  const uploadCertificate = async (file: File) => {
    if (!user) return null;
    
    setUploadingCertificate(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `certificates/${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast({
        title: "Error",
        description: "Failed to upload certificate",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingCertificate(false);
    }
  };

  // Add certificate to profile
  const addCertificate = async (name: string, file?: File) => {
    if (!authProfile?.certifications) return;
    
    let fileUrl = "";
    if (file) {
      const uploadedUrl = await uploadCertificate(file);
      if (uploadedUrl) {
        fileUrl = uploadedUrl;
      }
    }
    
    const newCertifications = [
      ...(authProfile.certifications || []),
      {
        name,
        file_url: fileUrl,
        verified: false
      }
    ];
    
    await updateProfile({ certifications: newCertifications });
  };
  
  // Remove certificate from profile
  const removeCertificate = async (index: number) => {
    if (!authProfile?.certifications) return;
    
    const newCertifications = [...authProfile.certifications];
    newCertifications.splice(index, 1);
    
    await updateProfile({ certifications: newCertifications });
  };

  return {
    user,
    profile: authProfile,
    loading,
    error,
    errorMessage,
    isEditMode,
    formData,
    profileData,
    setIsEditMode,
    setFormData,
    getUserName,
    getBusinessName,
    refreshProfile,
    updateProfile,
    handleRetryLoadProfile,
    uploadAvatar,
    uploadCertificate,
    addCertificate,
    removeCertificate,
    uploadingAvatar,
    uploadingCertificate
  };
};
