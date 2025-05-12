
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
  const [isEditMode, setIsEditMode] = useState(false);
  
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

  useEffect(() => {
    console.log("PersonalInformation mounted, current user:", user?.id);
    console.log("Current profile data:", profile);
    
    setLoading(true);
    setError(false);
    
    // Enhanced initial profile fetch
    const fetchInitialProfile = async () => {
      try {
        if (user && !profile) {
          console.log("No profile data yet, manually refreshing...");
          await refreshProfile();
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(true);
        toast.error("Failed to load profile data");
      } finally {
        // Always set loading to false, even if an error occurred
        setLoading(false);
      }
    };
    
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
    } else if (user) {
      // If we have a user but no profile, we should still stop loading
      // This gives us a chance to show a "create profile" UI instead of infinite loading
      setLoading(false);
    }
  }, [profile, user]);

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
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim();
    }
    
    // Try email as last resort
    if (user?.email) return user.email.split('@')[0];
    
    // Final fallback
    return "Your Name";
  };

  const getBusinessName = () => {
    return profile?.business_name || "Your Business";
  };
  
  return {
    user,
    profile,
    loading,
    error,
    isEditMode,
    formData,
    profileData,
    setIsEditMode,
    setFormData,
    getUserName,
    getBusinessName,
    refreshProfile
  };
};
