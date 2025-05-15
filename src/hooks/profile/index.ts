
import { useState, useCallback } from 'react';
import { useProfileBasics, ProfileDataState } from './useProfileBasics';
import { useProfileMedia } from './useProfileMedia';
import { useCertificationManager } from './useCertificationManager';
import { Profile } from '@/contexts/auth/types';

export type { ProfileDataState } from './useProfileBasics';

export const useProfileData = () => {
  const profileBasics = useProfileBasics();
  const { 
    user, profile, formData, setFormData,
    isEditMode, setIsEditMode
  } = profileBasics;
  
  const profileMedia = useProfileMedia(user);
  
  // Create a callback for certificate updates that updates the form data
  const handleCertificationsChange = useCallback((certifications: Profile['certifications']) => {
    setFormData(prev => ({
      ...prev,
      certifications
    }));
  }, [setFormData]);
  
  const certManager = useCertificationManager(
    user,
    formData.certifications || [],
    handleCertificationsChange
  );
  
  // Helper function to update the profile - ensure return type matches ProfileForm expectations
  const updateProfile = useCallback(async (profileData: Partial<Profile>): Promise<void> => {
    if (!profile) {
      return;
    }
    
    try {
      await profile.updateProfile(profileData);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }, [profile]);
  
  return {
    ...profileBasics,
    ...profileMedia,
    ...certManager,
    updateProfile
  };
};

export * from './useProfileBasics';
export * from './useProfileMedia';
export * from './useCertificationManager';
