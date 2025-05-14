
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/profile/ProfileProvider";
import { toast } from "sonner";
import { Profile, Certificate } from "@/contexts/auth/types";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileDataState {
  rating: number;
  jobsCompleted: number;
  certifications: Certificate[];
  reviews: Array<{
    reviewer: string;
    task: string;
    rating: number;
    feedback: string;
  }>;
}

export const useProfileData = () => {
  const { user } = useAuth();
  const { profile, loading, error, refreshProfile, updateProfile } = useProfile();
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    business_name: "",
    about: "",
    location: "",
    services: "",
    avatar_url: "",
    trade_registry_number: "",
    certifications: [] as Certificate[]
  });
  
  // Mock data that would eventually come from the database
  const [profileData, setProfileData] = useState<ProfileDataState>({
    rating: 4.9,
    jobsCompleted: 23,
    certifications: [
      { name: "Electrical License", verified: true },
      { name: "Plumbing Certificate", verified: true },
      { name: "Carpentry Qualification", verified: false },
    ],
    reviews: [
      { 
        reviewer: "Sarah M.", 
        task: "Kitchen Light Fixture Installation", 
        rating: 5, 
        feedback: "John was fantastic - arrived on time, did excellent work, and cleaned up afterward. Very professional." 
      },
      { 
        reviewer: "Michael T.", 
        task: "Bathroom Sink Repair", 
        rating: 5, 
        feedback: "Great service, fair price. Fixed my leaking sink quickly and efficiently." 
      },
      { 
        reviewer: "Rachel K.", 
        task: "Fan Installation", 
        rating: 4, 
        feedback: "Good work, just a bit delayed in arriving." 
      },
    ]
  });

  // Force a refresh when retryCount changes
  useEffect(() => {
    if (retryCount > 0) {
      refreshProfile();
    }
  }, [retryCount, refreshProfile]);

  useEffect(() => {
    // Set error message from error object
    if (error) {
      setErrorMessage(error.message || "Failed to load profile data");
    } else {
      setErrorMessage("");
    }
  }, [error]);

  const fetchInitialProfile = async () => {
    if (profile) {
      console.log("Loading profile data into form:", profile);
      
      setFormData({
        full_name: profile.full_name || "",
        business_name: profile.business_name || "",
        about: profile.about || "",
        location: profile.location || "",
        services: profile.services?.join(", ") || "",
        avatar_url: profile.avatar_url || "",
        trade_registry_number: profile.trade_registry_number || "",
        certifications: profile.certifications || []
      });
      
      // Update mock data with real data where available
      setProfileData(prev => ({
        ...prev,
        rating: profile.rating !== null ? profile.rating : prev.rating,
        jobsCompleted: profile.jobs_completed !== null ? profile.jobs_completed : prev.jobsCompleted,
        certifications: profile.certifications || prev.certifications
      }));
    }
  };

  useEffect(() => {
    fetchInitialProfile();
  }, [user, refreshProfile]);

  useEffect(() => {
    // Load the most recent profile data whenever the component mounts or profile changes
    if (profile) {
      console.log("Loading profile data into form:", profile);
      
      setFormData({
        full_name: profile.full_name || "",
        business_name: profile.business_name || "",
        about: profile.about || "",
        location: profile.location || "",
        services: profile.services?.join(", ") || "",
        avatar_url: profile.avatar_url || "",
        trade_registry_number: profile.trade_registry_number || "",
        certifications: profile.certifications || []
      });
      
      // Update mock data with real data where available
      setProfileData(prev => ({
        ...prev,
        rating: profile.rating !== null ? profile.rating : prev.rating,
        jobsCompleted: profile.jobs_completed !== null ? profile.jobs_completed : prev.jobsCompleted,
        certifications: profile.certifications || prev.certifications
      }));
    }
  }, [profile]);

  // Get user's name with fallbacks
  const getUserName = useCallback(() => {
    // Try profile full_name first
    if (profile?.full_name) return profile.full_name;
    
    // Try combining first and last name from profile
    if (profile?.first_name) {
      return `${profile.first_name} ${profile.last_name || ''}`.trim();
    }
    
    // Try user metadata
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name as string;
    if (user?.user_metadata?.first_name) {
      return `${user.user_metadata.first_name as string} ${user.user_metadata.last_name || ''}`.trim();
    }
    
    // Try email as last resort
    if (user?.email) return user.email.split('@')[0];
    
    // Final fallback
    return "Your Name";
  }, [profile, user]);

  const getBusinessName = useCallback(() => {
    return profile?.business_name || "Your Business";
  }, [profile]);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user?.id) {
      toast.error("You must be logged in to upload an avatar");
      return null;
    }
    
    try {
      setUploadingAvatar(true);
      
      // Create the path where we'll store the avatar
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      // Upload the file to the avatars bucket
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error("Error uploading avatar:", uploadError);
        toast.error("Failed to upload avatar");
        return null;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error("Exception uploading avatar:", error);
      toast.error("An unexpected error occurred");
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadCertificate = async (file: File, certName: string): Promise<string | null> => {
    if (!user?.id) {
      toast.error("You must be logged in to upload a certificate");
      return null;
    }
    
    try {
      setUploadingCertificate(true);
      
      // Create the path where we'll store the certificate
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      // Upload the file to the certificates bucket
      const { error: uploadError, data } = await supabase.storage
        .from('certificates')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error("Error uploading certificate:", uploadError);
        toast.error("Failed to upload certificate");
        return null;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error("Exception uploading certificate:", error);
      toast.error("An unexpected error occurred");
      return null;
    } finally {
      setUploadingCertificate(false);
    }
  };

  const addCertificate = async (name: string, file?: File) => {
    const newCert: Certificate = {
      name,
      verified: false // New certificates start as unverified
    };
    
    // If a file was provided, upload it
    if (file) {
      const fileUrl = await uploadCertificate(file, name);
      if (fileUrl) {
        newCert.file_url = fileUrl;
      }
    }
    
    // Add the new certificate to the form data
    const updatedCerts = [...formData.certifications, newCert];
    setFormData({
      ...formData,
      certifications: updatedCerts
    });
  };

  const removeCertificate = (index: number) => {
    const updatedCerts = [...formData.certifications];
    updatedCerts.splice(index, 1);
    
    setFormData({
      ...formData,
      certifications: updatedCerts
    });
  };

  const handleRetryLoadProfile = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);
  
  return {
    user,
    profile,
    loading,
    error,
    errorMessage,
    isEditMode,
    formData,
    profileData,
    uploadingAvatar,
    uploadingCertificate,
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
    removeCertificate
  };
};
