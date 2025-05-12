
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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
      fetchInitialProfile();
    }
  }, [retryCount]);

  const fetchInitialProfile = async () => {
    console.log("PersonalInformation loading profile, current user:", user?.id);
    
    // Only set loading to true if we're not retrying
    if (retryCount === 0) {
      setLoading(true);
    }
    setError(false);
    setErrorMessage("");
    
    try {
      if (user) {
        console.log("Fetching profile for user:", user.id);
        const result = await refreshProfile();
        console.log("Profile refresh result:", result !== undefined ? result : "undefined");
      } else {
        console.log("No user available, cannot fetch profile");
        setError(true);
        setErrorMessage("User not logged in. Please log in to view your profile.");
      }
    } catch (err: any) {
      console.error("Error fetching profile in useProfileData:", err);
      setError(true);
      setErrorMessage(err?.message || "Failed to load profile data");
      toast.error("Failed to load profile data");
    } finally {
      // Always set loading to false, regardless of result
      setLoading(false);
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
        avatar_url: profile.avatar_url || ""
      });
      
      // Update mock data with real data where available
      setProfileData(prev => ({
        ...prev,
        rating: profile.rating !== null ? profile.rating : prev.rating,
        jobsCompleted: profile.jobs_completed !== null ? profile.jobs_completed : prev.jobsCompleted
      }));
      
      setLoading(false);
      setError(false);
    }
  }, [profile]);

  // Get user's name with fallbacks
  const getUserName = () => {
    // Try profile full_name first
    if (profile?.full_name) return profile.full_name;
    
    // Try combining first and last name from profile
    if (profile?.first_name) {
      return `${profile.first_name} ${profile.last_name || ''}`.trim();
    }
    
    // Try user metadata
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.first_name) {
      return `${user.user_metadata.first_name as string} ${user.user_metadata.last_name || ''}`.trim();
    }
    
    // Try email as last resort
    if (user?.email) return user.email.split('@')[0];
    
    // Final fallback
    return "Your Name";
  };

  const getBusinessName = () => {
    return profile?.business_name || "Your Business";
  };

  const handleRetryLoadProfile = () => {
    setRetryCount(prev => prev + 1);
  };
  
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
    handleRetryLoadProfile
  };
};
