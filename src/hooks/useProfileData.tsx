
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/profile/ProfileProvider";
import { toast } from "sonner";
import { Profile } from "@/contexts/auth/types";

export interface ProfileDataState {
  rating: number;
  jobsCompleted: number;
  certifications: Array<{
    name: string;
    verified: boolean;
  }>;
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
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    business_name: "",
    about: "",
    location: "",
    services: "",
    avatar_url: ""
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
        avatar_url: profile.avatar_url || ""
      });
      
      // Update mock data with real data where available
      setProfileData(prev => ({
        ...prev,
        rating: profile.rating !== null ? profile.rating : prev.rating,
        jobsCompleted: profile.jobs_completed !== null ? profile.jobs_completed : prev.jobsCompleted
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
    setIsEditMode,
    setFormData,
    getUserName,
    getBusinessName,
    refreshProfile,
    updateProfile,
    handleRetryLoadProfile
  };
};
