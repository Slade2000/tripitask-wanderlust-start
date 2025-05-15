import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Profile, Certificate, certificationsFromJson, certificationsToJson } from '@/contexts/auth/types';
import { fetchUserProfile } from '@/contexts/auth/profileUtils';

// Define the context type
export interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
  refreshProfile: () => Promise<Profile | null>;
  updateProfile: (profileData: Partial<Profile>) => Promise<Profile | null>;
}

// Create the context with default values
const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: false,
  error: null,
  refreshProfile: async () => null,
  updateProfile: async () => null,
});

export const useProfile = () => useContext(ProfileContext);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastLoadTime, setLastLoadTime] = useState<number | null>(null);

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;
  
  // Refresh profile function with improved error handling and caching
  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (!user) {
      console.log("Cannot refresh profile: No user logged in");
      setProfile(null);
      setError(null);
      setLoading(false);
      return null;
    }
    
    // Don't reload if we loaded recently, unless forced
    const now = Date.now();
    if (lastLoadTime && now - lastLoadTime < CACHE_DURATION && profile) {
      console.log("Using cached profile data");
      return profile;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching profile for user: ${user.id}`);
      const updatedProfile = await fetchUserProfile(user.id);
      
      if (updatedProfile) {
        console.log("Profile loaded successfully", updatedProfile);
        
        // Add the updateProfile method to the profile object
        if (updatedProfile) {
          updatedProfile.updateProfile = async (profileData) => {
            return await updateProfile(profileData);
          };
        }
        
        setProfile(updatedProfile);
        setLastLoadTime(Date.now());
        return updatedProfile;
      } else {
        console.warn("Failed to fetch profile - returned null");
        setError(new Error('Failed to load profile data'));
        return null;
      }
    } catch (err) {
      console.error("Error refreshing profile:", err);
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, lastLoadTime, profile]);
  
  // Function to update profile data
  const updateProfile = async (profileData: Partial<Profile>): Promise<Profile | null> => {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return null;
    }
    
    setLoading(true);
    
    try {
      // Convert the certifications array to JSON format for database storage
      const dataToUpdate = {
        ...profileData,
        updated_at: new Date().toISOString(),
      };
      
      // Convert certificates array to JSON if present
      if (profileData.certifications !== undefined) {
        // Use the conversion utility to properly format certifications for the database
        const jsonCertifications = certificationsToJson(profileData.certifications);
        dataToUpdate.certifications = jsonCertifications;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .update(dataToUpdate)
        .eq("id", user.id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
        setError(error);
        return null;
      }
      
      // Create profile with computed properties
      const updatedProfile: Profile = {
        ...data,
        // Convert JSON certifications to properly typed Certificate array
        certifications: certificationsFromJson(data.certifications),
        first_name: data.full_name && data.full_name.includes(' ') 
          ? data.full_name.split(' ')[0] 
          : data.full_name,
        last_name: data.full_name && data.full_name.includes(' ')
          ? data.full_name.split(' ').slice(1).join(' ')
          : null
      };
      
      // Add the updateProfile method to the profile object
      updatedProfile.updateProfile = async (newProfileData) => {
        return await updateProfile(newProfileData);
      };
      
      setProfile(updatedProfile);
      setLastLoadTime(Date.now());
      toast.success("Profile updated successfully");
      return updatedProfile;
    } catch (err) {
      console.error("Exception updating profile:", err);
      toast.error("An unexpected error occurred");
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load profile when user changes
  useEffect(() => {
    if (user) {
      refreshProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user, refreshProfile]);

  // Set up real-time subscription for profile updates
  useEffect(() => {
    if (!user) return;
    
    // Subscribe to profile changes
    const subscription = supabase
      .channel(`profile:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Profile changed:', payload);
          await refreshProfile();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, refreshProfile]);

  return (
    <ProfileContext.Provider value={{
      profile,
      loading,
      error,
      refreshProfile,
      updateProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
};
