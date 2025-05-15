
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/auth';
import { Profile } from '@/contexts/auth/types';
import { fetchUserProfile } from '@/contexts/auth/profileUtils';
import { updateUserProfile, subscribeToProfileChanges } from './profileUtils';
import { ProfileContextType } from './types';
import { supabase } from '@/integrations/supabase/client';

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
  const updateProfile = useCallback(async (profileData: Partial<Profile>): Promise<Profile | null> => {
    if (!user) {
      return null;
    }
    
    setLoading(true);
    
    try {
      const updatedProfile = await updateUserProfile(user.id, profileData);
      
      if (updatedProfile) {
        // Add the updateProfile method to the profile object
        updatedProfile.updateProfile = async (newProfileData) => {
          return await updateProfile(newProfileData);
        };
        
        setProfile(updatedProfile);
        setLastLoadTime(Date.now());
        return updatedProfile;
      }
      
      return null;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

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
    
    const subscription = subscribeToProfileChanges(user.id, refreshProfile);
    
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
